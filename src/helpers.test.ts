import { describe, it, expect } from "vitest";
import { padStr, getNextSessionType } from "./helpers";

describe("helpers", () => {
  describe("padStr", () => {
    it("should pad single digit numbers with a leading zero", () => {
      expect(padStr(5)).toBe("05");
      expect(padStr(0)).toBe("00");
      expect(padStr(9)).toBe("09");
    });

    it("should not pad double digit numbers", () => {
      expect(padStr(10)).toBe("10");
      expect(padStr(59)).toBe("59");
    });
  });

  describe("getNextSessionType", () => {
    it("should return 'work' if the current mode is a break", () => {
      expect(getNextSessionType("shortBreak", 0)).toBe("work");
      expect(getNextSessionType("longBreak", 3)).toBe("work");
    });

    it("should return 'shortBreak' after a work session if count is not a multiple of 4", () => {
      // pomodoroCount is 0-indexed. 0 means 1st pomodoro is finishing.
      expect(getNextSessionType("work", 0)).toBe("shortBreak"); // 1st finishes
      expect(getNextSessionType("work", 1)).toBe("shortBreak"); // 2nd finishes
      expect(getNextSessionType("work", 2)).toBe("shortBreak"); // 3rd finishes
    });

    it("should return 'longBreak' after every 4th work session", () => {
      expect(getNextSessionType("work", 3)).toBe("longBreak"); // 4th finishes
      expect(getNextSessionType("work", 7)).toBe("longBreak"); // 8th finishes
      expect(getNextSessionType("work", 11)).toBe("longBreak"); // 12th finishes
    });
  });
});
