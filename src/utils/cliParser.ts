import { parseArgs } from "node:util";
import { SHORT_BREAK_TIME, LONG_BREAK_TIME } from "./constants";

/** Verbs that talk to a running session instead of opening the TUI. */
export const CONTROL_VERBS = [
  "status",
  "pause",
  "resume",
  "toggle",
  "skip",
  "reset",
  "stop",
] as const;

export type ControlVerb = (typeof CONTROL_VERBS)[number];

/** Internal verb the parent re-invokes itself with to become the owner. */
export const HEADLESS_VERB = "__run";

export type Verb = ControlVerb | "start" | typeof HEADLESS_VERB;

const VERBS: readonly string[] = [...CONTROL_VERBS, "start", HEADLESS_VERB];

export const isVerb = (value: string): value is Verb => VERBS.includes(value);

export type SessionConfig = {
  focus: number;
  shortBreak: number;
  longBreak: number;
  tag?: string | undefined;
  description?: string | undefined;
};

/** Durations exactly as given on the command line, no defaults filled in. */
export type SessionOverrides = {
  focus?: number | undefined;
  shortBreak?: number | undefined;
  longBreak?: number | undefined;
  tag?: string | undefined;
  description?: string | undefined;
};

export type ParsedArgs = {
  help: boolean;
  verb?: Verb | undefined;
  json?: boolean | undefined;
  goal?: number | undefined;
  sessionConfig?: SessionConfig | undefined;
  overrides?: SessionOverrides | undefined;
};

export const parseCliArgs = (args: string[]): ParsedArgs => {
  // A leading verb is peeled off before parseArgs, which is strict and would
  // reject it as an unexpected positional.
  let verb: Verb | undefined;
  const rest = [...args];
  const first = rest[0];

  if (first !== undefined && !first.startsWith("-")) {
    if (!isVerb(first)) {
      throw new Error(
        `Unknown command: ${first}. Valid commands are: start, ${CONTROL_VERBS.join(", ")}.`,
      );
    }
    verb = first;
    rest.shift();
  }

  const options = {
    work: { type: "string", short: "w" },
    break: { type: "string", short: "b" },
    "long-break": { type: "string", short: "l" },
    tag: { type: "string", short: "t" },
    description: { type: "string", short: "d" },
    goal: { type: "string", short: "g" },
    json: { type: "boolean" },
    help: { type: "boolean", short: "h" },
  } as const;

  const { values } = parseArgs({ args: rest, options, strict: true });

  if (values.help) {
    return { help: true };
  }

  const parseNum = (
    val: string | undefined,
    name: string,
  ): number | undefined => {
    if (val === undefined) return undefined;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      throw new Error(`--${name} must be a positive number.`);
    }
    return num;
  };

  const focus = parseNum(values.work, "work");
  const shortBreak = parseNum(values.break, "break");
  const longBreak = parseNum(values["long-break"], "long-break");
  const tag = values.tag;
  const description = values.description;
  const goal = parseNum(values.goal, "goal");

  const base: ParsedArgs = { help: false };
  if (verb !== undefined) base.verb = verb;
  if (values.json) base.json = true;
  if (goal !== undefined) base.goal = goal;

  // `start` and `__run` fill their gaps from the last session at run time, so
  // they take the durations raw rather than through the TUI's stricter rules.
  if (verb === "start" || verb === HEADLESS_VERB) {
    base.overrides = { focus, shortBreak, longBreak, tag, description };
    return base;
  }

  if (focus === undefined) {
    if (
      shortBreak !== undefined ||
      longBreak !== undefined ||
      tag !== undefined ||
      description !== undefined
    ) {
      throw new Error(
        "--work option is required when specifying custom session configurations.",
      );
    }
    return base;
  }

  base.sessionConfig = {
    focus,
    shortBreak: shortBreak ?? SHORT_BREAK_TIME,
    longBreak: longBreak ?? (shortBreak ? shortBreak * 3 : LONG_BREAK_TIME),
    tag,
    description,
  };

  return base;
};
