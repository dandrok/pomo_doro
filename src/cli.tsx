#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import { parseCliArgs, config } from "@utils";
import { App } from "./app";

try {
  const { help, goal, sessionConfig } = parseCliArgs(process.argv.slice(2));

  if (goal !== undefined) {
    config.set("dailyGoal", goal);
  }

  if (help) {
    console.log(`
Pomo Doro - CLI Pomodoro Timer

Usage:
  pomo [options]

Options:
  -w, --work <minutes>        Set custom focus session duration
  -b, --break <minutes>       Set custom short break duration
  -l, --long-break <minutes>  Set custom long break duration (defaults to 3x short break)
  -t, --tag <string>          Set the tag/category name
  -d, --description <string>  Set an optional description for the session
  -g, --goal <number>         Set your daily Pomodoro goal
  -h, --help                  Show help details
`);
    process.exit(0);
  }

  render(<App initialSessionConfig={sessionConfig} />);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  console.error("Run 'pomo --help' to see valid options.");
  process.exit(1);
}
