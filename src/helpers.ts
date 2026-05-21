export type Mode = "work" | "shortBreak" | "longBreak";

export const padStr = (num: number) => String(num).padStart(2, "0");

export const getNextSessionType = (currentMode: Mode, pomodoroCount: number): Mode => {
  if (currentMode !== "work") {
    return "work";
  }
  
  // After every 4th pomodoro, take a long break
  const completedPomodoros = pomodoroCount + 1;
  return completedPomodoros % 4 === 0 ? "longBreak" : "shortBreak";
};
