import fs from "node:fs";
import {
  config,
  statusFile,
  ONE_MINUTE,
  getNextSessionType,
  updateFocusTime,
  incrementPomodoroCount,
  notifyUser,
  padStr,
  modeIcons,
} from "@utils";
import type { DailyStats, Mode } from "@types";
import {
  buildHistoryWindow,
  todayDate,
  todayStatsOf,
  writeIdleState,
  writeState,
  type PomoState,
} from "./state";

export type SessionOwner = "tui" | "headless";

export type SessionInit = {
  focus: number;
  shortBreak: number;
  longBreak: number;
  tag?: string | undefined;
  description?: string | undefined;
  mode?: Mode | undefined;
  secondsRemaining?: number | undefined;
  pomodoroCount?: number | undefined;
  owner: SessionOwner;
};

const HISTORY_FLUSH_MS = 30_000;

/**
 * The pomodoro clock, with no React in it.
 *
 * This is the same machine `useTimer` + `usePomodoroSession` ran inside the Ink
 * app - same phase transitions, same history accounting, same notifications -
 * lifted out so a headless process can own it. Exactly one Session exists at a
 * time across the whole machine, enforced by the control socket in `server.ts`;
 * two would each call `updateFocusTime` once a second and double-count the day.
 */
export class Session {
  readonly owner: SessionOwner;

  focus: number;
  shortBreak: number;
  longBreak: number;
  tag: string | undefined;
  description: string | undefined;

  mode: Mode;
  totalSeconds: number;
  secondsRemaining: number;
  pomodoroCount: number;
  isPaused = false;

  private history: DailyStats[];
  private ticker: NodeJS.Timeout | null = null;
  private flusher: NodeJS.Timeout | null = null;
  private listeners = new Set<(state: PomoState) => void>();
  private stopped = false;

  constructor(init: SessionInit) {
    this.owner = init.owner;
    this.focus = init.focus;
    this.shortBreak = init.shortBreak;
    this.longBreak = init.longBreak;
    this.tag = init.tag;
    this.description = init.description;

    this.mode = init.mode ?? "work";
    this.totalSeconds = this.durationOf(this.mode) * ONE_MINUTE;
    this.secondsRemaining = init.secondsRemaining ?? this.totalSeconds;
    this.pomodoroCount = init.pomodoroCount ?? 0;

    this.history = config.get("history") ?? [];
  }

  /** Live, so a setting changed in the TUI is picked up by a headless owner. */
  private get isAutoTransition(): boolean {
    return config.get("autoTransition") ?? true;
  }

  private durationOf(mode: Mode): number {
    return mode === "work"
      ? this.focus
      : mode === "shortBreak"
        ? this.shortBreak
        : this.longBreak;
  }

  // --- lifecycle ----------------------------------------------------------

  start(): this {
    if (this.ticker) return this;
    this.ticker = setInterval(() => this.tick(), 1000);
    this.flusher = setInterval(() => this.flushHistory(), HISTORY_FLUSH_MS);
    this.persist();
    return this;
  }

  /**
   * Ends the session and hands the machine back to "nothing running". Safe to
   * call twice - exit handlers and an explicit `pomo stop` can both reach it.
   */
  stop(): void {
    if (this.stopped) return;
    this.stopped = true;

    if (this.ticker) clearInterval(this.ticker);
    if (this.flusher) clearInterval(this.flusher);
    this.ticker = null;
    this.flusher = null;

    this.flushHistory();
    // A finished session must not keep offering itself on the Resume screen.
    config.delete("activeSession");
    writeIdleState(this.history);
    this.emit();
  }

  onChange(listener: (state: PomoState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- commands -----------------------------------------------------------

  pause(): void {
    this.isPaused = true;
    this.persist();
  }

  resume(): void {
    this.isPaused = false;
    this.persist();
  }

  toggle(): void {
    if (this.isPaused) this.resume();
    else this.pause();
  }

  /** Restart the current phase from the top. */
  restart(): void {
    this.reset(this.durationOf(this.mode) * ONE_MINUTE);
    this.persist();
  }

  /** Abandon the current phase and move to the next one, uncounted. */
  skip(): void {
    if (this.mode === "work") {
      this.mode = "shortBreak";
      this.reset(this.shortBreak * ONE_MINUTE, !this.isAutoTransition);
      notifyUser(
        "Pomo Doro - Work Skipped",
        "Focus session skipped. Taking a short break.",
      );
    } else {
      this.mode = "work";
      this.reset(this.focus * ONE_MINUTE, !this.isAutoTransition);
      notifyUser("Pomo Doro - Break Skipped", "Break skipped. Time to focus!");
    }
    this.persist();
  }

  private reset(newTotalSeconds: number, startPaused = false): void {
    this.totalSeconds = newTotalSeconds;
    this.secondsRemaining = newTotalSeconds;
    this.isPaused = startPaused;
  }

  // --- the clock ----------------------------------------------------------

  private tick(): void {
    if (!this.isPaused && this.secondsRemaining > 0) {
      this.secondsRemaining = Math.max(0, this.secondsRemaining - 1);

      // Focus time accrues per elapsed second, breaks do not - matching what
      // the Ink app credited.
      if (this.mode === "work") {
        this.history = updateFocusTime(this.history, todayDate(), this.tag);
      }
    }

    this.persist();

    if (this.secondsRemaining === 0 && !this.isPaused) {
      this.handleTimeUp();
    }
  }

  private handleTimeUp(): void {
    const wasWork = this.mode === "work";
    const nextMode = getNextSessionType(this.mode, this.pomodoroCount);
    this.mode = nextMode;

    if (wasWork) {
      this.pomodoroCount += 1;
      // A completed pomodoro is written through immediately rather than waiting
      // for the 30s flush: it is the one event worth losing nothing of.
      this.history = incrementPomodoroCount(
        this.history,
        todayDate(),
        this.tag,
      );
      config.set("history", this.history);

      const duration =
        nextMode === "longBreak" ? this.longBreak : this.shortBreak;
      this.reset(duration * ONE_MINUTE, !this.isAutoTransition);

      const breakType = nextMode === "longBreak" ? "long break" : "short break";
      notifyUser(
        "Pomo Doro - Work Done!",
        `Focus session complete! Take a ${breakType}.`,
      );
    } else {
      this.reset(this.focus * ONE_MINUTE, !this.isAutoTransition);
      notifyUser(
        "Pomo Doro - Break Finished!",
        "Break is over. Time to focus!",
      );
    }

    this.persist();
  }

  // --- persistence --------------------------------------------------------

  private flushHistory(): void {
    config.set("history", this.history);
  }

  private persist(): void {
    config.set("activeSession", {
      timeOut: this.secondsRemaining,
      mode: this.mode,
      time: this.focus, // legacy fallback for backward compatibility
      focus: this.focus,
      shortBreak: this.shortBreak,
      longBreak: this.longBreak,
      pomodoroCount: this.pomodoroCount,
      tag: this.tag,
      description: this.description,
    });
    config.set("pomodoroCount", this.pomodoroCount);

    this.writeStatusFile();
    writeState(this.snapshot());
    this.emit();
  }

  /** Legacy one-liner kept alive for existing tmux and starship setups. */
  private writeStatusFile(): void {
    const min = padStr(Math.floor(this.secondsRemaining / ONE_MINUTE));
    const sec = padStr(this.secondsRemaining % ONE_MINUTE);
    const statusText = `${modeIcons[this.mode]} ${min}:${sec}`;

    fs.promises.writeFile(statusFile, statusText, "utf-8").catch(() => {
      // Silent fail to prevent timer crash
    });
  }

  private emit(): void {
    const state = this.snapshot();
    for (const listener of this.listeners) listener(state);
  }

  snapshot(): PomoState {
    const date = todayDate();

    return {
      version: 1,
      running: !this.stopped,
      paused: this.isPaused,
      mode: this.mode,
      secondsRemaining: this.secondsRemaining,
      totalSeconds: this.totalSeconds,
      progress:
        this.totalSeconds === 0
          ? 0
          : (this.totalSeconds - this.secondsRemaining) / this.totalSeconds,
      pomodoroCount: this.pomodoroCount,
      focus: this.focus,
      shortBreak: this.shortBreak,
      longBreak: this.longBreak,
      tag: this.tag,
      description: this.description,
      owner: this.owner,
      pid: process.pid,
      today: todayStatsOf(this.history, date),
      dailyGoal: config.get("dailyGoal"),
      history14: buildHistoryWindow(this.history, date),
      updatedAt: new Date().toISOString(),
    };
  }
}
