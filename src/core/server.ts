import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { socketPath } from "@utils";
import {
  isCommand,
  probeOwner,
  type CommandName,
  type CommandResponse,
} from "./client";
import { Session } from "./session";
import { writeIdleState } from "./state";

const isWindows = process.platform === "win32";

const unlinkSocket = (): void => {
  if (isWindows) return; // Named pipes vanish with the process.
  try {
    fs.unlinkSync(socketPath);
  } catch {
    // Already gone, which is the outcome we wanted.
  }
};

const listen = (server: net.Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(socketPath, () => {
      server.removeListener("error", reject);
      resolve();
    });
  });

/**
 * Make sure the directory we are about to bind in is ours alone.
 *
 * mkdirSync's `mode` is masked by umask and, more importantly, does nothing at
 * all to a directory that already exists. Under XDG_RUNTIME_DIR that is
 * harmless - the kernel gives each user their own 0700 tmpfs - but the
 * fallback lives in a world-writable /tmp, where anyone can pre-create the
 * directory and then talk to the socket we put inside it.
 */
const secureDir = (dir: string): void => {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

  // Ownership is checked before anything is changed: chmod on a directory
  // belonging to someone else fails with a bare EPERM, which says nothing
  // about why we refused.
  const stats = fs.lstatSync(dir);

  if (!stats.isDirectory()) {
    throw new Error(`${dir} exists but is not a directory.`);
  }

  const uid = process.getuid?.();
  if (uid !== undefined && stats.uid !== uid) {
    throw new Error(
      `${dir} is owned by uid ${stats.uid}, not you. Refusing to put a control socket there.`,
    );
  }

  // The directory is ours, so a loose mode is ours to tighten. mkdirSync's
  // `mode` only applies to a directory it actually creates, and umask can
  // loosen even that.
  if (stats.mode & 0o077) {
    fs.chmodSync(dir, 0o700);
  }
};

/**
 * Try to become the process that owns the clock.
 *
 * Returns a bound server on success, or null when another owner already holds
 * the socket - in which case the caller should attach as a client instead of
 * starting a second timer. A socket left behind by a killed process is
 * distinguished from a live one by probing it: a refused connection means the
 * file is stale and can be removed.
 */
export const claimOwnership = async (): Promise<net.Server | null> => {
  if (!isWindows) {
    secureDir(path.dirname(socketPath));
  }

  const server = net.createServer();

  try {
    await listen(server);
    return server;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EADDRINUSE") throw err;
  }

  if (await probeOwner()) return null;

  unlinkSocket();

  try {
    await listen(server);
    return server;
  } catch {
    // Someone else won the race to replace the stale socket. They are the owner.
    return null;
  }
};

const dispatch = (session: Session, cmd: CommandName): CommandResponse => {
  switch (cmd) {
    case "status":
      break;
    case "pause":
      session.pause();
      break;
    case "resume":
      session.resume();
      break;
    case "toggle":
      session.toggle();
      break;
    case "skip":
      session.skip();
      break;
    case "reset":
      session.restart();
      break;
    case "stop":
      // Stop before replying, not after: the caller (and the bar widget
      // watching state.json) must never see `running: true` for a session that
      // has already been told to end.
      session.stop();
      break;
  }

  return { ok: true, state: session.snapshot() };
};

export type ServeOptions = {
  /**
   * Whether to tear the process down on SIGINT. The Ink app handles Ctrl+C
   * itself - exiting from under it would skip Ink's terminal restore and leave
   * the shell without a cursor.
   */
  handleInterrupt?: boolean;
  /**
   * Whether a `stop` command ends the process. True for a headless owner,
   * whose only reason to exist is the session. False for the Ink app, where
   * `pomo stop` in another terminal should end the session without also
   * closing the app someone is looking at.
   */
  exitOnStop?: boolean;
};

/**
 * Serve commands for `session`, and leave the machine in a clean "nothing
 * running" state when the process goes away.
 */
export const serve = (
  server: net.Server,
  session: Session,
  { handleInterrupt = true, exitOnStop = true }: ServeOptions = {},
): void => {
  server.on("connection", (socket) => {
    let buffer = "";

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf-8");

      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
        if (line === "") continue;

        let response: CommandResponse;
        let shouldStop = false;

        try {
          const { cmd } = JSON.parse(line) as { cmd: unknown };

          // Validate before dispatching: `dispatch`'s switch has no default, so
          // an unknown verb would otherwise fall through every case and be
          // answered with a cheerful `ok: true` having done nothing.
          if (typeof cmd !== "string" || !isCommand(cmd)) {
            response = {
              ok: false,
              error: `Unrecognized command: ${String(cmd)}`,
            };
          } else {
            response = dispatch(session, cmd);
            shouldStop = cmd === "stop";
          }
        } catch {
          response = { ok: false, error: `Malformed request: ${line}` };
        }

        socket.write(`${JSON.stringify(response)}\n`);

        if (shouldStop && !exitOnStop) {
          // The Ink app stays up; it just stops being the owner.
          socket.end();
          releaseOwnership(server, session);
        } else if (shouldStop) {
          // The session is already stopped; all that is left is to let the
          // reply drain before exiting. The timer is a fallback for a client
          // that destroys its end of the connection before the callback fires,
          // which would otherwise leave this process alive with no clock.
          socket.end(() => shutdown(server, session, 0));
          setTimeout(() => shutdown(server, session, 0), 250).unref();
        }
      }
    });

    socket.on("error", () => socket.destroy());
  });

  const onSignal = () => shutdown(server, session, 0);
  if (handleInterrupt) process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  process.once("SIGHUP", onSignal);

  // The Ink app owns its session for as long as the process lives - leaving
  // the Timer screen only detaches the view. So the release has to happen on
  // the way out, or quitting the app would leave a socket nothing is listening
  // on and a state file claiming a session is still running. Everything
  // releaseOwnership does is synchronous, which is all an exit handler can do.
  process.once("exit", () => releaseOwnership(server, session));
};

// Tracked per server, not per process: the Ink app can own, release, and own
// again within one process when you start a second session from the menu, and
// a process-wide flag would make every release after the first a no-op.
const released = new WeakSet<net.Server>();

/**
 * Flush the session, stop listening, and blank the state file - without
 * exiting. This is the path the Ink app takes when its Timer screen unmounts:
 * the session ends but the process lives on to render the menu.
 *
 * Idempotent, because a signal arriving while an explicit `stop` is already
 * unwinding must not run it twice.
 */
export const releaseOwnership = (
  server: net.Server,
  session: Session | null,
): void => {
  if (released.has(server)) return;
  released.add(server);

  session?.stop();
  if (!session) writeIdleState();

  server.close();
  unlinkSocket();
};

/** Release, then exit. Used by the headless owner and by `pomo stop`. */
export const shutdown = (
  server: net.Server,
  session: Session | null,
  code: number,
): void => {
  releaseOwnership(server, session);
  process.exit(code);
};
