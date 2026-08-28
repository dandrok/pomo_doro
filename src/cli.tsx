#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import { parseCliArgs, config, HEADLESS_VERB } from "@utils";
import {
  runHeadless,
  startDetached,
  runControlCommand,
  isCommand,
} from "./core";
import { App } from "./app";

const HELP = `
Pomo Doro - CLI Pomodoro Timer

Usage:
  pomo [options]            Open the terminal UI
  pomo <command> [options]

Commands:
  start                       Start a pomodoro with no terminal attached
  status                      Print the current session
  pause | resume | toggle     Control the running session
  skip                        Skip to the next phase
  reset                       Restart the current phase
  stop                        End the running session

Options:
  -w, --work <minutes>        Set custom focus session duration
  -b, --break <minutes>       Set custom short break duration
  -l, --long-break <minutes>  Set custom long break duration (defaults to 3x short break)
  -t, --tag <string>          Set the tag/category name
  -d, --description <string>  Set an optional description for the session
  -g, --goal <number>         Set your daily Pomodoro goal
      --json                  Print machine-readable state (with a command)
  -h, --help                  Show help details

The terminal UI and the Omarchy bar widget drive the same session: whichever
starts first owns the clock, and everything else attaches to it.
`;

const main = async (): Promise<void> => {
  const { help, verb, json, goal, sessionConfig, overrides } = parseCliArgs(
    process.argv.slice(2),
  );

  if (goal !== undefined) {
    config.set("dailyGoal", goal);
  }

  if (help) {
    console.log(HELP);
    process.exit(0);
  }

  if (verb === HEADLESS_VERB) {
    // Never returns: this process becomes the session owner.
    await runHeadless(overrides ?? {});
    return;
  }

  if (verb === "start") {
    process.exit(await startDetached(overrides ?? {}));
  }

  if (verb !== undefined && isCommand(verb)) {
    process.exit(await runControlCommand(verb, json ?? false));
  }

  render(<App initialSessionConfig={sessionConfig} />);
};

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  console.error("Run 'pomo --help' to see valid options.");
  process.exit(1);
});
