import fs from "node:fs";
import {
  config,
  statusFile,
  ONE_MINUTE,
  FOCUS_TIME,
  SHORT_BREAK_TIME,
  LONG_BREAK_TIME,
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

/**
 * A phase length has to be positive, or the clock never leaves zero: tick()
 * would find secondsRemaining already at 0 and call handleTimeUp on every
 * pass, counting a completed pomodoro a second for as long as it ran.
 *
 * Zero reaches here more easily than it looks. Resume reads `focus` straight
 * out of config.json with `??`, which passes 0 through untouched, and
 * `pomo start` inherits durations from the last stored session. So this
 * guards the boundary rather than trusting either caller.
 */
const positiveMinutes = (
  value: number | undefined,
  fallback: number,
): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;

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
    this.focus = positiveMinutes(init.focus, FOCUS_TIME);
    this.shortBreak = positiveMinutes(init.shortBreak, SHORT_BREAK_TIME);
    this.longBreak = positiveMinutes(init.longBreak, LONG_BREAK_TIME);
    this.tag = init.tag;
    this.description = init.description;

    this.mode = init.mode ?? "work";
    this.totalSeconds = this.durationOf(this.mode) * ONE_MINUTE;
    // A stored remaining time can be corrupt too; anything unusable restarts
    // the phase rather than leaving the clock stuck at or below zero.
    this.secondsRemaining =
      typeof init.secondsRemaining === "number" &&
      Number.isFinite(init.secondsRemaining) &&
      init.secondsRemaining > 0
        ? Math.min(init.secondsRemaining, this.totalSeconds)
        : this.totalSeconds;
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
    // Stopping is terminal. Restarting the intervals here would tick while
    // snapshot() still reported running: false and writeStatusFile() stayed
    // shut down - an invisible session that nonetheless kept crediting focus
    // seconds to history. A new session means a new Session.
    if (this.stopped || this.ticker) return this;
    this.ticker = setInterval(() => this.tick(), 1000);
    this.flusher = setInterval(() => {
      this.flushHistory();
      this.saveResumable();
    }, HISTORY_FLUSH_MS);
    this.saveResumable();
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
    // The resumable session is kept, not deleted. Ending the clock is not the
    // same as discarding where you got to, and the Resume screen is the only
    // way back into a session after the app closes.
    this.saveResumable();
    writeIdleState(this.history);

    // current.txt is a countdown, so leaving the last one behind would have
    // tmux and starship showing a timer that stopped hours ago. Removing it
    // rather than blanking it also lets starship's `test -f` hide the module.
    // Safe to unlink now: `stopped` was set at the top of this method and
    // writeStatusFile both checks it and writes synchronously, so no write can
    // still be pending or start after this point. Advisory, so a failure is
    // not worth reporting.
    try {
      fs.unlinkSync(statusFile);
    } catch {
      // Already gone, or never written.
    }

    this.emit();
  }

  onChange(listener: (state: PomoState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- commands -----------------------------------------------------------

  pause(): void {
    this.isPaused = true;
    this.saveResumable();
    this.persist();
  }

  resume(): void {
    this.isPaused = false;
    this.saveResumable();
    this.persist();
  }

  toggle(): void {
    if (this.isPaused) this.resume();
    else this.pause();
  }

  /** Restart the current phase from the top. */
  restart(): void {
    this.reset(this.durationOf(this.mode) * ONE_MINUTE);
    this.saveResumable();
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
    this.saveResumable();
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

    this.saveResumable();
    this.persist();
  }

  // --- persistence --------------------------------------------------------

  private flushHistory(): void {
    config.set("history", this.history);
  }

  /**
   * Write the resumable session and the counter into config.json.
   *
   * Deliberately off the per-tick path. `conf` re-serializes the whole config
   * file on every `set`, history included, so doing this once a second meant
   * rewriting all of it twice a second - a cost that grows with every day you
   * have ever used the app. state.json still carries the same numbers every
   * tick, so no external reader loses resolution; only the Resume screen's
   * starting point can trail, and never by more than the flush interval.
   */
  private saveResumable(): void {
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
  }

  /** Everything cheap enough to run every second. */
  private persist(): void {
    // Built once and shared: snapshot() walks history to rebuild the 14-day
    // window, and taking it twice also let the file and the listeners carry
    // updatedAt timestamps a millisecond apart.
    const state = this.snapshot();
    this.writeStatusFile();
    writeState(state);
    this.emit(state);
  }

  /**
   * Legacy one-liner kept alive for existing tmux and starship setups.
   *
   * Written synchronously, like writeState above it. An async write here could
   * still be in flight when stop() unlinks the file and would then land after
   * it, recreating the stale countdown stop() exists to remove. Serializing
   * the two is not an option: stop() runs from a process exit handler, where a
   * promise never settles.
   */
  private writeStatusFile(): void {
    if (this.stopped) return;

    const min = padStr(Math.floor(this.secondsRemaining / ONE_MINUTE));
    const sec = padStr(this.secondsRemaining % ONE_MINUTE);

    try {
      fs.writeFileSync(
        statusFile,
        `${modeIcons[this.mode]} ${min}:${sec}`,
        "utf-8",
      );
    } catch {
      // Advisory file: a failure must never take the timer down.
    }
  }

  private emit(state: PomoState = this.snapshot()): void {
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
