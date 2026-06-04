import { parseArgs } from "node:util";
import { SHORT_BREAK_TIME, LONG_BREAK_TIME } from "./constants";

export type ParsedArgs = {
  help: boolean;
  sessionConfig?:
    | {
        focus: number;
        shortBreak: number;
        longBreak: number;
        tag?: string | undefined;
        description?: string | undefined;
      }
    | undefined;
};

export const parseCliArgs = (args: string[]): ParsedArgs => {
  const options = {
    work: { type: "string", short: "w" },
    break: { type: "string", short: "b" },
    "long-break": { type: "string", short: "l" },
    tag: { type: "string", short: "t" },
    description: { type: "string", short: "d" },
    help: { type: "boolean", short: "h" },
  } as const;

  const { values } = parseArgs({ args, options, strict: true });

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
    return { help: false };
  }

  return {
    help: false,
    sessionConfig: {
      focus,
      shortBreak: shortBreak ?? SHORT_BREAK_TIME,
      longBreak: longBreak ?? (shortBreak ? shortBreak * 3 : LONG_BREAK_TIME),
      tag,
      description,
    },
  };
};
