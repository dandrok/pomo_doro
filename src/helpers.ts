export type Mode = "work" | "shortBreak" | "longBreak";

export const padStr = (num: number) => String(num).padStart(2, "0");

export const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const getNextSessionType = (currentMode: Mode, pomodoroCount: number): Mode => {
  if (currentMode !== "work") {
    return "work";
  }
  
  // After every 4th pomodoro, take a long break
  const completedPomodoros = pomodoroCount + 1;
  return completedPomodoros % 4 === 0 ? "longBreak" : "shortBreak";
};
