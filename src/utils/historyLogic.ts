import type { DailyStats } from "@types";

export const updateFocusTime = (
  history: DailyStats[],
  date: string,
  tag: string = "General",
): DailyStats[] => {
  const todayIndex = history.findIndex((h) => h.date === date);
  const cleanTag = tag.trim() || "General";

  if (todayIndex !== -1) {
    const updatedHistory = [...history];
    const day = updatedHistory[todayIndex];
    if (day) {
      const tags = day.tags || {};
      const tagData = tags[cleanTag] || {
        focusSeconds: 0,
        completedPomodoros: 0,
      };

      updatedHistory[todayIndex] = {
        ...day,
        totalFocusSeconds: day.totalFocusSeconds + 1,
        tags: {
          ...tags,
          [cleanTag]: {
            ...tagData,
            focusSeconds: tagData.focusSeconds + 1,
          },
        },
      };
      return updatedHistory;
    }
  }

  return [
    ...history,
    {
      date,
      totalFocusSeconds: 1,
      completedPomodoros: 0,
      tags: {
        [cleanTag]: { focusSeconds: 1, completedPomodoros: 0 },
      },
    },
  ];
};

export const incrementPomodoroCount = (
  history: DailyStats[],
  date: string,
  tag: string = "General",
): DailyStats[] => {
  const todayIndex = history.findIndex((h) => h.date === date);
  const cleanTag = tag.trim() || "General";

  if (todayIndex !== -1) {
    const updatedHistory = [...history];
    const day = updatedHistory[todayIndex];
    if (day) {
      const tags = day.tags || {};
      const tagData = tags[cleanTag] || {
        focusSeconds: 0,
        completedPomodoros: 0,
      };

      updatedHistory[todayIndex] = {
        ...day,
        completedPomodoros: day.completedPomodoros + 1,
        tags: {
          ...tags,
          [cleanTag]: {
            ...tagData,
            completedPomodoros: tagData.completedPomodoros + 1,
          },
        },
      };
      return updatedHistory;
    }
  }

  return [
    ...history,
    {
      date,
      totalFocusSeconds: 0,
      completedPomodoros: 1,
      tags: {
        [cleanTag]: { focusSeconds: 0, completedPomodoros: 1 },
      },
    },
  ];
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

export type TagTotal = {
  tag: string;
  focusSeconds: number;
  completedPomodoros: number;
};

export const calculateTagTotals = (history: DailyStats[]): TagTotal[] => {
  const totalsMap: { [tag: string]: { seconds: number; pomodoros: number } } =
    {};

  for (const day of history) {
    if (day.tags) {
      for (const [tag, stats] of Object.entries(day.tags)) {
        if (!totalsMap[tag]) {
          totalsMap[tag] = { seconds: 0, pomodoros: 0 };
        }
        totalsMap[tag].seconds += stats.focusSeconds;
        totalsMap[tag].pomodoros += stats.completedPomodoros;
      }
    } else {
      const tag = "General";
      if (!totalsMap[tag]) {
        totalsMap[tag] = { seconds: 0, pomodoros: 0 };
      }
      totalsMap[tag].seconds += day.totalFocusSeconds;
      totalsMap[tag].pomodoros += day.completedPomodoros;
    }
  }

  return Object.entries(totalsMap)
    .map(([tag, data]) => ({
      tag,
      focusSeconds: data.seconds,
      completedPomodoros: data.pomodoros,
    }))
    .sort((a, b) => b.focusSeconds - a.focusSeconds);
};
