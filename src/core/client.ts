import net from "node:net";
import { socketPath } from "@utils";
import type { PomoState } from "./state";

/** Commands the owner accepts over the control socket. */
export const COMMANDS = [
  "status",
  "pause",
  "resume",
  "toggle",
  "skip",
  "reset",
  "stop",
] as const;

export type CommandName = (typeof COMMANDS)[number];

export const isCommand = (value: string): value is CommandName =>
  (COMMANDS as readonly string[]).includes(value);

export type CommandResponse =
  { ok: true; state: PomoState } | { ok: false; error: string };

const TIMEOUT_MS = 2000;

/**
 * Is a session owner alive right now?
 *
 * Liveness is "something is listening on the socket", not "a pid exists": the
 * owner unlinks the socket on exit and the kernel refuses connections to an
 * orphaned one, so there is no window where a reader mistakes a dead process
 * for a running timer.
 */
export const probeOwner = (): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = net.connect(socketPath);
    const finish = (alive: boolean) => {
      socket.destroy();
      resolve(alive);
    };

    socket.setTimeout(TIMEOUT_MS, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });

/**
 * Send one command and return the owner's reply, or null when no owner is
 * running. Callers distinguish "no session" (null) from "the session refused"
 * (`{ ok: false }`).
 */
export const sendCommand = (
  cmd: CommandName,
): Promise<CommandResponse | null> =>
  new Promise((resolve) => {
    const socket = net.connect(socketPath);
    let buffer = "";
    let settled = false;

    const settle = (value: CommandResponse | null) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(TIMEOUT_MS, () => settle(null));
    socket.once("connect", () => socket.write(`${JSON.stringify({ cmd })}\n`));
    socket.once("error", () => settle(null));

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf-8");
      const newline = buffer.indexOf("\n");
      if (newline === -1) return;

      try {
        settle(JSON.parse(buffer.slice(0, newline)) as CommandResponse);
      } catch {
        settle({
          ok: false,
          error: "Malformed reply from the running session.",
        });
      }
    });

    // `stop` closes the connection from the far side; without a reply by then
    // there is nothing more to wait for.
    socket.once("close", () => settle(null));
  });
