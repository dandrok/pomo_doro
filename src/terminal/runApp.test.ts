// @vitest-environment node
import { describe, it, expect } from "vitest";
import { runWithScreen, type AppRun } from "./runApp";

type TestApp = {
  readonly waitUntilExit: () => Promise<unknown>;
};

const createRecorder = (
  options: {
    mountThrows?: boolean;
    exitRejects?: boolean;
  } = {},
) => {
  const events: string[] = [];
  const app: AppRun<TestApp> = {
    takeOver: () => {
      events.push("take-over");
      return () => events.push("release-screen");
    },
    mount: () => {
      if (options.mountThrows) {
        events.push("mount-threw");
        throw new Error("mount failed");
      }
      events.push("mount");
      return {
        waitUntilExit: async () => {
          events.push("wait");
          if (options.exitRejects) {
            throw new Error("exit failed");
          }
        },
      };
    },
    dispose: () => {
      events.push("dispose");
    },
  };
  return { events, app };
};

describe("runWithScreen", () => {
  it("orchestrates lifecycle in strict order: takeOver -> mount -> wait -> release -> dispose", async () => {
    const { events, app } = createRecorder();

    await runWithScreen(app);

    expect(events).toEqual([
      "take-over",
      "mount",
      "wait",
      "release-screen",
      "dispose",
    ]);
  });

  it("releases screen and runs dispose even when mount throws", async () => {
    const { events, app } = createRecorder({ mountThrows: true });

    await expect(runWithScreen(app)).rejects.toThrow("mount failed");

    expect(events).toEqual([
      "take-over",
      "mount-threw",
      "release-screen",
      "dispose",
    ]);
  });

  it("releases screen and runs dispose even when exit rejects", async () => {
    const { events, app } = createRecorder({ exitRejects: true });

    await expect(runWithScreen(app)).rejects.toThrow("exit failed");

    expect(events).toEqual([
      "take-over",
      "mount",
      "wait",
      "release-screen",
      "dispose",
    ]);
  });

  it("releases screen before dispose throws", async () => {
    const { events, app } = createRecorder();
    const throwingApp: AppRun<TestApp> = {
      ...app,
      dispose: () => {
        events.push("dispose-threw");
        throw new Error("dispose failed");
      },
    };

    await expect(runWithScreen(throwingApp)).rejects.toThrow("dispose failed");

    expect(events).toEqual([
      "take-over",
      "mount",
      "wait",
      "release-screen",
      "dispose-threw",
    ]);
  });
});
