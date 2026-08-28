// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import net from "node:net";

const paths = vi.hoisted(() => {
  // Built as plain strings: vi.hoisted runs before any import, and both
  // writeState and claimOwnership create their own directory anyway. The
  // socket name is kept short - a unix socket path has a ~100 byte limit.
  const dir = `${process.env["TMPDIR"] ?? "/tmp"}/pomo-server-${process.pid}`;
  return {
    dir,
    statusFile: `${dir}/current.txt`,
    stateFile: `${dir}/state.json`,
    socketPath: `${dir}/s.sock`,
  };
});

const store = vi.hoisted(() => new Map<string, unknown>());

vi.mock("../utils/config", () => ({
  config: {
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    delete: (key: string) => store.delete(key),
    path: `${paths.dir}/config.json`,
  },
  configDir: paths.dir,
  statusFile: paths.statusFile,
  stateFile: paths.stateFile,
  socketPath: paths.socketPath,
}));

vi.mock("../utils/notifications", () => ({
  notifyUser: vi.fn(),
  playSound: vi.fn(),
  sendNotification: vi.fn(),
}));

const { claimOwnership, serve, releaseOwnership } = await import("./server");
const { probeOwner, sendCommand } = await import("./client");
const { Session } = await import("./session");
const { readState } = await import("./state");

describe("ownership and the control socket", () => {
  let server: net.Server | null = null;
  let session: InstanceType<typeof Session> | null = null;

  const own = async () => {
    server = await claimOwnership();
    if (!server) throw new Error("expected to win ownership");
    session = new Session({
      focus: 1,
      shortBreak: 1,
      longBreak: 2,
      tag: "Coding",
      owner: "headless",
    });
    serve(server, session, { handleInterrupt: false });
    session.start();
    return session;
  };

  beforeEach(() => {
    store.clear();
    store.set("history", []);
  });

  afterEach(() => {
    if (server) releaseOwnership(server, session);
    server = null;
    session = null;
  });

  it("reports no owner before anything claims the socket", async () => {
    expect(await probeOwner()).toBe(false);
    expect(await sendCommand("status")).toBeNull();
  });

  it("allows exactly one owner at a time", async () => {
    await own();

    expect(await probeOwner()).toBe(true);
    // The whole point: a second starter must attach, never run a second clock.
    expect(await claimOwnership()).toBeNull();
  });

  it("applies commands sent over the socket", async () => {
    const live = await own();

    const paused = await sendCommand("pause");
    expect(paused?.ok).toBe(true);
    expect(live.isPaused).toBe(true);
    if (paused?.ok) expect(paused.state.paused).toBe(true);

    await sendCommand("resume");
    expect(live.isPaused).toBe(false);

    const skipped = await sendCommand("skip");
    expect(live.mode).toBe("shortBreak");
    if (skipped?.ok) expect(skipped.state.mode).toBe("shortBreak");
  });

  it("answers status without changing anything", async () => {
    const live = await own();

    const before = live.secondsRemaining;
    const response = await sendCommand("status");

    expect(response?.ok).toBe(true);
    expect(live.secondsRemaining).toBe(before);
    expect(live.isPaused).toBe(false);
  });

  it("rejects an unknown command without dropping the session", async () => {
    const live = await own();

    const reply = await new Promise<string>((resolve) => {
      const socket = net.connect(paths.socketPath, () =>
        socket.write('{"cmd":"detonate"}\n'),
      );
      socket.on("data", (chunk) => {
        socket.destroy();
        resolve(chunk.toString("utf-8"));
      });
    });

    expect(JSON.parse(reply)).toMatchObject({ ok: false });
    expect(live.secondsRemaining).toBeGreaterThan(0);
  });

  it("takes over a socket left behind by a killed owner", async () => {
    // A process killed with SIGKILL leaves the socket file with nothing
    // listening on it. Starting again must succeed, not fail as "already
    // running" forever.
    const orphan = net.createServer();
    await new Promise<void>((resolve) =>
      orphan.listen(paths.socketPath, resolve),
    );
    await new Promise<void>((resolve) => orphan.close(() => resolve()));
    fs.writeFileSync(paths.socketPath, "");

    expect(await probeOwner()).toBe(false);
    await expect(own()).resolves.toBeDefined();
  });

  it("unlinks the socket and blanks the state on release", async () => {
    await own();
    expect(fs.existsSync(paths.socketPath)).toBe(true);

    releaseOwnership(server!, session);
    server = null;

    expect(fs.existsSync(paths.socketPath)).toBe(false);
    expect(readState()).toMatchObject({ running: false, owner: "none" });
    expect(await probeOwner()).toBe(false);
  });
});
