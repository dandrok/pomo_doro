import { useState, useCallback, useEffect, useRef } from "react";
import type { DailyStats } from "../types";
import {
  config,
  updateFocusTime,
  incrementPomodoroCount,
  calculateTotals,
  IS_TEST_MODE,
} from "@utils";

export const useHistory = () => {
  const [history, setHistory] = useState<DailyStats[]>(() => {
    const saved = config.get("history") || [];

    // Seed mock data if in test mode and empty
    if (IS_TEST_MODE && saved.length === 0) {
      const mockHistory: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        mockHistory.push({
          date: d.toISOString().split("T")[0]!,
          totalFocusSeconds: Math.floor(Math.random() * 7200) + 1800,
          completedPomodoros: Math.floor(Math.random() * 5) + 1,
        });
      }
      config.set("history", mockHistory);
      return mockHistory;
    }
    return saved;
  });

  // Keep a ref to the latest history to avoid stale state in callbacks
  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const saveToDisk = useCallback((newHistory: DailyStats[]) => {
    config.set("history", newHistory);
    setHistory(newHistory);
  }, []);

  const addFocusSecond = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]!;
    const updated = updateFocusTime(historyRef.current, today);

    // Performance optimization: We only set React state (triggers re-render)
    // but we'll use a separate effect to sync to disk less frequently if needed.
    // For now, let's keep it simple but separate the logic.
    setHistory(updated);
  }, []);

  const completeSession = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]!;
    const updated = incrementPomodoroCount(historyRef.current, today);
    saveToDisk(updated);
  }, [saveToDisk]);

  // Sync to disk every 30 seconds to prevent data loss while avoiding excessive writes
  useEffect(() => {
    const interval = setInterval(() => {
      config.set("history", historyRef.current);
    }, 30000);
    return () => {
      clearInterval(interval);
      config.set("history", historyRef.current); // Final sync on unmount
    };
  }, []);

  const totals = calculateTotals(history);

  return {
    history,
    addFocusSecond,
    completeSession,
    totals,
    saveToDisk,
  };
};
