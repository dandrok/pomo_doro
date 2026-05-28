import { describe, it, expect } from "vitest";
import {
  updateFocusTime,
  incrementPomodoroCount,
  calculateTotals,
} from "./historyLogic";
import type { DailyStats } from "./config";

describe("historyLogic", () => {
  describe("updateFocusTime", () => {
    it("should create a new entry if the date doesn't exist", () => {
      const history: DailyStats[] = [];
      const date = "2026-05-16";
      const result = updateFocusTime(history, date);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: "2026-05-16",
        totalFocusSeconds: 1,
        completedPomodoros: 0,
      });
    });

    it("should increment focus time if the date already exists", () => {
      const history: DailyStats[] = [
        { date: "2026-05-16", totalFocusSeconds: 10, completedPomodoros: 1 },
      ];
      const date = "2026-05-16";
      const result = updateFocusTime(history, date);

      expect(result).toHaveLength(1);
      expect(result[0]?.totalFocusSeconds).toBe(11);
      expect(result[0]?.completedPomodoros).toBe(1);
    });

    it("should not affect other dates", () => {
      const history: DailyStats[] = [
        { date: "2026-05-15", totalFocusSeconds: 100, completedPomodoros: 2 },
      ];
      const date = "2026-05-16";
      const result = updateFocusTime(history, date);

      expect(result).toHaveLength(2);
      expect(result[0]?.date).toBe("2026-05-15");
      expect(result[1]?.date).toBe("2026-05-16");
    });
  });

  describe("incrementPomodoroCount", () => {
    it("should create a new entry with 1 completion if the date doesn't exist", () => {
      const history: DailyStats[] = [];
      const date = "2026-05-16";
      const result = incrementPomodoroCount(history, date);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: "2026-05-16",
        totalFocusSeconds: 0,
        completedPomodoros: 1,
      });
    });

    it("should increment completion count if the date already exists", () => {
      const history: DailyStats[] = [
        { date: "2026-05-16", totalFocusSeconds: 10, completedPomodoros: 1 },
      ];
      const date = "2026-05-16";
      const result = incrementPomodoroCount(history, date);

      expect(result).toHaveLength(1);
      expect(result[0]?.completedPomodoros).toBe(2);
      expect(result[0]?.totalFocusSeconds).toBe(10);
    });
  });

  describe("calculateTotals", () => {
    it("should return zeros for empty history", () => {
      const result = calculateTotals([]);
      expect(result).toEqual({ totalFocusSeconds: 0, totalCompleted: 0 });
    });

    it("should sum up all focus time and completions", () => {
      const history: DailyStats[] = [
        { date: "2026-05-15", totalFocusSeconds: 3600, completedPomodoros: 2 },
        { date: "2026-05-16", totalFocusSeconds: 1800, completedPomodoros: 1 },
      ];
      const result = calculateTotals(history);
      expect(result).toEqual({ totalFocusSeconds: 5400, totalCompleted: 3 });
    });
  });
});
