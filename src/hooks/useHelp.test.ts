import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useStdin } from "ink";
import type { EventEmitter } from "node:events";
import { useHelp } from "./useHelp";

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

describe("useHelp", () => {
  it("starts closed", () => {
    const { result } = renderHook(() => useHelp());

    expect(result.current.isHelpOpen).toBe(false);
  });

  it("opens when toggleHelp is called", () => {
    const { result } = renderHook(() => useHelp());

    act(() => result.current.toggleHelp());

    expect(result.current.isHelpOpen).toBe(true);
  });

  it("closes again when toggleHelp is called a second time", () => {
    const { result } = renderHook(() => useHelp());

    act(() => result.current.toggleHelp());
    act(() => result.current.toggleHelp());

    expect(result.current.isHelpOpen).toBe(false);
  });

  it("closes itself when 'h' is pressed while open", () => {
    const { result } = renderHook(() => ({
      help: useHelp(),
      stdin: useStdin(),
    }));
    const emitter = getEventEmitter(result.current.stdin);

    act(() => result.current.help.toggleHelp());
    expect(result.current.help.isHelpOpen).toBe(true);

    press(emitter, "h");

    expect(result.current.help.isHelpOpen).toBe(false);
  });

  it("closes itself when Escape is pressed while open", () => {
    const { result } = renderHook(() => ({
      help: useHelp(),
      stdin: useStdin(),
    }));
    const emitter = getEventEmitter(result.current.stdin);

    act(() => result.current.help.toggleHelp());
    press(emitter, ESCAPE);

    expect(result.current.help.isHelpOpen).toBe(false);
  });

  it("can be reopened after being closed by the internal listener", () => {
    const { result } = renderHook(() => ({
      help: useHelp(),
      stdin: useStdin(),
    }));
    const emitter = getEventEmitter(result.current.stdin);

    act(() => result.current.help.toggleHelp());
    press(emitter, ESCAPE);
    expect(result.current.help.isHelpOpen).toBe(false);

    act(() => result.current.help.toggleHelp());

    expect(result.current.help.isHelpOpen).toBe(true);
  });
});
