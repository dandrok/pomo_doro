import path from "node:path";
import os from "node:os";
import Conf from "conf";
import type { ConfigSchema } from "@types";

const IS_TEST_MODE = process.env["NODE_ENV"] === "test";

export const config = new Conf<ConfigSchema>({
  projectName: IS_TEST_MODE ? "pomo-doro-test" : "pomo-doro",
  defaults: {
    pomodoroCount: 0,
    history: [],
    isMuted: false,
  },
});

export const configDir = path.dirname(config.path);

/** Legacy one-line status for tmux / starship: "◈ 24:59". */
export const statusFile = path.join(configDir, "current.txt");

/** Machine-readable session state, watched by the Omarchy bar widget. */
export const stateFile = path.join(configDir, "state.json");

/**
 * Control socket for whichever process currently owns the clock.
 *
 * Lives in XDG_RUNTIME_DIR (a per-user 0700 tmpfs) so a stale socket cannot
 * outlive the login session. When that is unset - over a bare SSH session, or
 * in a container - it falls back to a uid-scoped directory under the system
 * temp dir, which is world-writable and therefore not private by itself: the
 * uid in the name only avoids collisions, it grants nothing. `claimOwnership`
 * in src/core/server.ts is what makes the fallback safe, refusing to bind
 * unless the directory is owned by this user with no group or other access.
 */
export const socketPath = ((): string => {
  const name = IS_TEST_MODE ? "pomo-doro-test" : "pomo-doro";

  if (process.platform === "win32") {
    return `\\\\.\\pipe\\${name}`;
  }

  const runtime = process.env["XDG_RUNTIME_DIR"];
  const base =
    runtime && runtime !== ""
      ? path.join(runtime, name)
      : path.join(os.tmpdir(), `${name}-${process.getuid?.() ?? 0}`);

  return path.join(base, "control.sock");
})();
