// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  ENTER_ALTERNATE_SCREEN,
  LEAVE_ALTERNATE_SCREEN,
  takeOverScreen,
  type ScreenSink,
} from "./alternateScreen";

const createSink = (isTTY?: boolean) => {
  const written: string[] = [];
  const sink: ScreenSink = {
    write: (chunk: string) => {
      written.push(chunk);
    },
    isTTY,
  };
  return { written, sink };
};

describe("the alternate screen buffer", () => {
  it("enters alternate screen when TTY is true and restores on release", () => {
    const { written, sink } = createSink(true);
    const restore = takeOverScreen(sink);

    expect(written).toEqual([ENTER_ALTERNATE_SCREEN]);

    restore();

    expect(written).toEqual([ENTER_ALTERNATE_SCREEN, LEAVE_ALTERNATE_SCREEN]);
  });

  it("releases exactly once across multiple invocations (idempotence)", () => {
    const { written, sink } = createSink(true);
    const restore = takeOverScreen(sink);

    restore();
    restore();
    restore();

    expect(
      written.filter((chunk) => chunk === LEAVE_ALTERNATE_SCREEN),
    ).toHaveLength(1);
  });

  it("does not enter alternate screen on non-TTY streams (pipes, CI, redirect)", () => {
    for (const isTTY of [false, undefined]) {
      const { written, sink } = createSink(isTTY);
      const restore = takeOverScreen(sink);
      restore();

      expect(written).toEqual([]);
    }
  });

  it("uses the 1049 escape sequences that switch buffers and preserve cursor", () => {
    expect(ENTER_ALTERNATE_SCREEN).toBe("\u001b[?1049h");
    expect(LEAVE_ALTERNATE_SCREEN).toBe("\u001b[?1049l");
  });
});
