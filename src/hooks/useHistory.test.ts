import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useHistory } from "./useHistory";
import { config } from "../config";

// Mock the config module
vi.mock("../config", () => ({
  config: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock IS_TEST_MODE to false for predictable tests
vi.mock("../constants", () => ({
  IS_TEST_MODE: false,
}));

describe("useHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with data from config", () => {
    const mockData = [{ date: "2026-05-16", totalFocusSeconds: 60, completedPomodoros: 1 }];
    vi.mocked(config.get).mockReturnValue(mockData);

    const { result } = renderHook(() => useHistory());

    expect(result.current.history).toEqual(mockData);
    expect(result.current.totals.totalFocusSeconds).toBe(60);
  });

  it("should add focus seconds", () => {
    vi.mocked(config.get).mockReturnValue([]);
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addFocusSecond();
    });

    expect(result.current.totals.totalFocusSeconds).toBe(1);
  });

  it("should increment completion count", () => {
    vi.mocked(config.get).mockReturnValue([]);
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.completeSession();
    });

    expect(result.current.totals.totalCompleted).toBe(1);
    expect(config.set).toHaveBeenCalledWith("history", expect.any(Array));
  });

  it("should sync to disk periodically", () => {
    vi.mocked(config.get).mockReturnValue([]);
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addFocusSecond();
    });

    // Should not have synced to disk yet (buffered)
    expect(config.set).not.toHaveBeenCalled();

    // Advance time by 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(config.set).toHaveBeenCalledWith("history", expect.any(Array));
  });
});
