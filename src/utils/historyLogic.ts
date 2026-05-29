import type { DailyStats } from "../types";

export const updateFocusTime = (
  history: DailyStats[],
  date: string,
): DailyStats[] => {
  const todayIndex = history.findIndex((h) => h.date === date);

  if (todayIndex !== -1) {
    const updatedHistory = [...history];
    const day = updatedHistory[todayIndex];
    if (day) {
      updatedHistory[todayIndex] = {
        ...day,
        totalFocusSeconds: day.totalFocusSeconds + 1,
      };
      return updatedHistory;
    }
  }

  return [...history, { date, totalFocusSeconds: 1, completedPomodoros: 0 }];
};

export const incrementPomodoroCount = (
  history: DailyStats[],
  date: string,
): DailyStats[] => {
  const todayIndex = history.findIndex((h) => h.date === date);

  if (todayIndex !== -1) {
    const updatedHistory = [...history];
    const day = updatedHistory[todayIndex];
    if (day) {
      updatedHistory[todayIndex] = {
        ...day,
        completedPomodoros: day.completedPomodoros + 1,
      };
      return updatedHistory;
    }
  }

  return [...history, { date, totalFocusSeconds: 0, completedPomodoros: 1 }];
};

export const calculateTotals = (history: DailyStats[]) => {
  const totalFocusSeconds = history.reduce(
    (acc, curr) => acc + curr.totalFocusSeconds,
    0,
  );
  const totalCompleted = history.reduce(
    (acc, curr) => acc + curr.completedPomodoros,
    0,
  );

  return { totalFocusSeconds, totalCompleted };
};
