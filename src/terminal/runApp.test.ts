// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { runApp, type MountedApp } from "./runApp";

describe("runApp", () => {
  it("mounts app and resolves cleanly on normal exit", async () => {
    let unmounted = false;
    const mockApp: MountedApp = {
      waitUntilExit: vi.fn().mockResolvedValue(undefined),
      unmount: () => {
        unmounted = true;
      },
    };
    const exitProcess = vi.fn() as unknown as (code: number) => never;

    await runApp(() => mockApp, exitProcess);

    expect(mockApp.waitUntilExit).toHaveBeenCalledTimes(1);
    expect(unmounted).toBe(false);
    expect(exitProcess).not.toHaveBeenCalled();
  });

  it("handles SIGTERM by unmounting and exiting with code 143", async () => {
    let resolveWait: () => void = () => undefined;
    let unmounted = false;

    const mockApp: MountedApp = {
      waitUntilExit: () =>
        new Promise<void>((resolve) => {
          resolveWait = resolve;
        }),
      unmount: () => {
        unmounted = true;
        resolveWait();
      },
    };

    const exitCodes: number[] = [];
    const exitProcess = vi.fn((code: number) => {
      exitCodes.push(code);
      return undefined as never;
    });

    const runPromise = runApp(() => mockApp, exitProcess);

    // Emit SIGTERM while running
    process.emit("SIGTERM");

    await runPromise;

    expect(unmounted).toBe(true);
    expect(exitCodes).toEqual([143]);
  });

  it("handles SIGHUP by unmounting and exiting with code 129", async () => {
    let resolveWait: () => void = () => undefined;
    let unmounted = false;

    const mockApp: MountedApp = {
      waitUntilExit: () =>
        new Promise<void>((resolve) => {
          resolveWait = resolve;
        }),
      unmount: () => {
        unmounted = true;
        resolveWait();
      },
    };

    const exitCodes: number[] = [];
    const exitProcess = vi.fn((code: number) => {
      exitCodes.push(code);
      return undefined as never;
    });

    const runPromise = runApp(() => mockApp, exitProcess);

    // Emit SIGHUP while running
    process.emit("SIGHUP");

    await runPromise;

    expect(unmounted).toBe(true);
    expect(exitCodes).toEqual([129]);
  });

  it("removes signal listeners even when waitUntilExit throws", async () => {
    const mockApp: MountedApp = {
      waitUntilExit: vi.fn().mockRejectedValue(new Error("Ink runtime crash")),
      unmount: vi.fn(),
    };
    const exitProcess = vi.fn() as unknown as (code: number) => never;

    const listenerCountBefore =
      process.listenerCount("SIGTERM") + process.listenerCount("SIGHUP");

    await expect(runApp(() => mockApp, exitProcess)).rejects.toThrow(
      "Ink runtime crash",
    );

    const listenerCountAfter =
      process.listenerCount("SIGTERM") + process.listenerCount("SIGHUP");

    expect(listenerCountAfter).toBe(listenerCountBefore);
    expect(exitProcess).not.toHaveBeenCalled();
  });
});
