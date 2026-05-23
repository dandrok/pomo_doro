import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTimer } from "./useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with the correct values", () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60 })
    );

    expect(result.current.secondsRemaining).toBe(60);
    expect(result.current.totalSeconds).toBe(60);
    expect(result.current.progress).toBe(0);
    expect(result.current.isPaused).toBe(false);
  });

  it("should initialize with initialSecondsRemaining if provided", () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 60, initialSecondsRemaining: 30 })
    );

    expect(result.current.secondsRemaining).toBe(30);
    expect(result.current.totalSeconds).toBe(60);
    expect(result.current.progress).toBe(0.5);
  });

  it("should countdown every second", () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 10 })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsRemaining).toBe(9);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsRemaining).toBe(8);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsRemaining).toBe(7);
  });

  it("should pause the countdown", () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 10 })
    );

    act(() => {
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Should still be 10 because it's paused
    expect(result.current.secondsRemaining).toBe(10);
  });

  it("should resume the countdown after pausing", () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 10 })
    );

    act(() => {
      result.current.pause();
    });
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.secondsRemaining).toBe(10);

    act(() => {
      result.current.resume();
    });
    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsRemaining).toBe(9);
  });

  it("should reset to a new total duration", () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 10 })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsRemaining).toBe(9);

    act(() => {
      result.current.reset(20);
    });
    expect(result.current.secondsRemaining).toBe(20);
    expect(result.current.totalSeconds).toBe(20);
    expect(result.current.progress).toBe(0);
    expect(result.current.isPaused).toBe(false);
  });

  it("should trigger onTimeUp when timer reaches zero", () => {
    const onTimeUp = vi.fn();
    renderHook(() =>
      useTimer({ initialSeconds: 3, onTimeUp })
    );

    act(() => {
      vi.advanceTimersByTime(1000); // 3 -> 2
    });
    act(() => {
      vi.advanceTimersByTime(1000); // 2 -> 1
    });
    act(() => {
      vi.advanceTimersByTime(1000); // 1 -> 0
    });
    
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it("should calculate progress correctly during countdown", () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 4 })
    );

    act(() => {
      vi.advanceTimersByTime(1000); // 4 -> 3 (25%)
    });
    expect(result.current.progress).toBe(0.25);

    act(() => {
      vi.advanceTimersByTime(1000); // 3 -> 2 (50%)
    });
    expect(result.current.progress).toBe(0.5);

    act(() => {
      vi.advanceTimersByTime(1000); // 2 -> 1 (75%)
    });
    expect(result.current.progress).toBe(0.75);

    act(() => {
      vi.advanceTimersByTime(1000); // 1 -> 0 (100%)
    });
    expect(result.current.progress).toBe(1);
  });
});
