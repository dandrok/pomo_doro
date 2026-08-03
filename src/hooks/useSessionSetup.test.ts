import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useStdin } from "ink";
import type { EventEmitter } from "node:events";
import { useSessionSetup } from "./useSessionSetup";

// Ink has no public testing utility and this project has no ink-testing-library
// dependency, so keypresses are simulated by emitting directly on the same
// internal_eventEmitter useInput subscribes to outside of a real terminal render tree.
const getEventEmitter = (stdin: ReturnType<typeof useStdin>) =>
  (stdin as unknown as { internal_eventEmitter: EventEmitter })
    .internal_eventEmitter;

const press = (emitter: EventEmitter, data: string) => {
  act(() => {
    emitter.emit("input", data);
  });
};

const ESCAPE = "\u001B";
const DOWN_ARROW = "\u001B[B";

const baseProps = {
  initialFocus: 25,
  initialShortBreak: 5,
  initialLongBreak: 15,
  startFocusedOnStartButton: false,
  onStart: vi.fn(),
};

describe("useSessionSetup — isHelpOpen guard", () => {
  it("responds to navigation and escape when help is closed", () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() => ({
      setup: useSessionSetup({ ...baseProps, onCancel, isHelpOpen: false }),
      stdin: useStdin(),
    }));
    const emitter = getEventEmitter(result.current.stdin);

    expect(result.current.setup.activeField).toBe("focus");

    press(emitter, DOWN_ARROW);
    expect(result.current.setup.activeField).toBe("shortBreak");

    press(emitter, ESCAPE);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("ignores navigation and escape while help is open", () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() => ({
      setup: useSessionSetup({ ...baseProps, onCancel, isHelpOpen: true }),
      stdin: useStdin(),
    }));
    const emitter = getEventEmitter(result.current.stdin);

    press(emitter, DOWN_ARROW);
    expect(result.current.setup.activeField).toBe("focus");

    press(emitter, ESCAPE);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
