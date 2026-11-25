<h1 align="center">Pomo Doro</h1>

<p align="center">
  <strong>A sleek, modular Pomodoro timer for your terminal.</strong><br>
  Built with React, Ink, and TypeScript.
</p>

<p align="center">
  <a href="https://github.com/dandrok/pomo_doro/actions/workflows/publish.yml"><img src="https://img.shields.io/github/actions/workflow/status/dandrok/pomo_doro/publish.yml?branch=main&label=CI&logo=githubactions&logoColor=white&style=flat-square" alt="CI status"></a>
  <a href="https://www.npmjs.com/package/pomo-doro-tui"><img src="https://img.shields.io/npm/v/pomo-doro-tui?label=npm&logo=npm&logoColor=white&style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/pomo-doro-tui"><img src="https://img.shields.io/npm/dm/pomo-doro-tui?label=downloads&logo=npm&logoColor=white&style=flat-square" alt="npm downloads"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/dandrok/pomo_doro?label=license&style=flat-square" alt="MIT license"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%E2%89%A522-5FA04E?logo=nodedotjs&logoColor=white&style=flat-square" alt="Node.js 22 or newer"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript 6.0"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React 19"></a>
</p>

<p align="center">
  <img src="./assets/demo.gif" alt="Pomo Doro terminal UI walkthrough" width="820">
</p>

Pomo Doro is a full-featured Pomodoro timer that runs entirely in your
terminal. Sessions cycle between focus and breaks, your history and goals are
tracked automatically, and a single owner process keeps every view — the TUI,
the CLI, and your status bar — in sync.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Controls](#controls)
- [One session, many views](#one-session-many-views)
- [Status bar integrations](#status-bar-integrations)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Development](#development)
- [CI/CD & releases](#cicd--releases)
- [Contributing](#contributing)
- [License](#license)

## Features

**Focus, without leaving the terminal**

- **Terminal-native TUI** — a big-text countdown, progress bars, and a layout
  that adapts between side-by-side and stacked as you resize the window.
- **Automatic or manual transitions** — let the next phase start on its own, or
  press `a` to require confirmation, so a timer never runs while you are away
  from the keyboard.
- **Keyboard-first controls** — pause, skip, restart, and mute without touching
  a mouse.
- **Presets and custom sessions** — start from a built-in preset or build your
  own with the interactive setup wizard, including a tag and description.
- **Contextual help** — press `h` on any screen with a footer to open a help
  panel listing every shortcut and what it does.
- **Appearance customizer** — change the clock font style and color theme with
  a live preview.

**A record of where your time went**

- **Daily goals** — set a daily pomodoro goal and a focus-time goal, then watch
  your progress on the timer screen.
- **Analytics dashboard** — a GitHub-style activity heatmap, stacked bar
  charts, and a 15-week productivity history.
- **Persistence and resume** — progress is stored locally, and an interrupted
  session can be resumed exactly where it left off.

**Fits into your setup**

- **Cross-platform notifications** — native desktop notifications and sound
  alerts on Linux, macOS, and Windows, toggleable at any time with `m`.
- **Headless sessions** — `pomo start` runs the clock detached from a terminal,
  so a session survives closing the window it was started in.
- **Status bar exports** — write a one-line status and the full session state
  for tmux, Waybar, Polybar, or Starship, with a companion
  [Omarchy bar widget](https://github.com/dandrok/omarchy-pomo-doro) available.
- **One clock, many views** — exactly one process owns the timer; opening the
  TUI attaches another view instead of starting a second timer.

## Requirements

- **Node.js 22 or newer** (required by Ink 8)
- A terminal on **Linux**, **macOS**, or **Windows**
- For Linux desktop notifications: `notify-send` (usually provided by
  libnotify). macOS and Windows use built-in system tools.

## Installation

### npm (recommended)

Install Pomo Doro globally and run `pomo` from anywhere:

```bash
npm install -g pomo-doro-tui
pomo
```

Or try it without installing:

```bash
npx pomo-doro-tui
```

### From source

```bash
git clone https://github.com/dandrok/pomo_doro.git
cd pomo_doro
npm install
npm run dev
```

## Usage

Run `pomo` with no arguments to open the interactive menu. You can also start a
session directly from the command line:

```bash
# A 50-minute focus block with a 10-minute break
pomo --work 50 --break 10

# A custom session with a tag and description
pomo -w 25 -l 20 -t "Deep Work" -d "Refactor the auth module"
```

When CLI arguments are used, the main menu is bypassed and the session starts
immediately.

### CLI options

| Option                   | Alias | Description                                                          |
| :----------------------- | :---- | :------------------------------------------------------------------- |
| `--work <minutes>`       | `-w`  | Set custom focus session duration (minutes)                          |
| `--break <minutes>`      | `-b`  | Set custom short break duration (minutes)                            |
| `--long-break <minutes>` | `-l`  | Set custom long break duration (minutes, defaults to 3x short break) |
| `--tag <string>`         | `-t`  | Set the tag/category name                                            |
| `--description <string>` | `-d`  | Set an optional description for the session                          |
| `--goal <number>`        | `-g`  | Set your daily pomodoro goal                                         |
| `--version`              | `-v`  | Print the version number                                             |
| `--help`                 | `-h`  | Show help details                                                    |

> [!NOTE]
> `--work` (or `-w`) is required if you want to customize break durations via
> the command line.

### CLI verbs

A session can also be driven without the TUI:

| Command                            | Does                                       |
| :--------------------------------- | :----------------------------------------- |
| `pomo start [-w -b -l -t -d]`      | Start a pomodoro with no terminal attached |
| `pomo status [--json]`             | Print the current session                  |
| `pomo pause` / `resume` / `toggle` | Control the running session                |
| `pomo skip`                        | Skip to the next phase                     |
| `pomo reset`                       | Restart the current phase                  |
| `pomo stop`                        | End the running session                    |
| `pomo version [--json]`            | Print the version details                  |

## Controls

### General and timer controls

| Key      | Action                                                                         |
| :------- | :----------------------------------------------------------------------------- |
| `p`      | Toggle pause / resume                                                          |
| `a`      | Toggle auto / manual transition mode (wait for confirmation between sessions)  |
| `r`      | Restart current timer from the beginning                                       |
| `s`      | Skip current session (discards work session, skips break to start focus early) |
| `m`      | Toggle mute (silence OS notifications and audio alerts)                        |
| `h`      | Show the help overlay listing what every key on the current screen does        |
| `Esc`    | Go back to previous menu, or safely pause/exit the current timer to the menu   |
| `Ctrl+C` | Force quit application                                                         |

### Custom preset and settings controls

| Key              | Action                                                                              |
| :--------------- | :---------------------------------------------------------------------------------- |
| `Up` / `Down`    | Navigate between fields (Focus, Short Break, Long Break, Tag, Description, Start)   |
| `Left` / `Right` | Decrease / increase the active duration value, or cycle between default/recent tags |
| `Typing`         | Enter custom tags and descriptions on their respective fields                       |
| `Enter`          | Advance to the next field, or start the session (when on Start)                     |

## One session, many views

Exactly one process runs the clock at a time. It claims that role by binding a
unix socket in `$XDG_RUNTIME_DIR`, so whoever starts first owns the timer and
everything else attaches to it:

```text
        owner (runs the clock, writes history)
        ├── pomo start   detached, no terminal
        └── pomo         terminal UI

        views
        ├── pomo         attaches when an owner already exists
        └── bar widget   reads state.json, runs `pomo <verb>`
```

Open `pomo` while a session is already running and it drops straight onto the
live countdown; its keys drive the same clock. Two independent timers would
each credit the day once a second and double-count it, which is exactly what
the single-owner rule exists to prevent.

## Status bar integrations

The timer writes two files on every tick, both next to `config.json` in
`~/.config/pomo-doro-nodejs/`:

- `current.txt` — one line of text, e.g. `◈ 24:59`
- `state.json` — the full session state, for anything that wants more than a
  label

<details>
<summary><code>state.json</code> example</summary>

```jsonc
{
  "version": 1,
  "running": true,
  "paused": false,
  "mode": "work", // work | shortBreak | longBreak
  "secondsRemaining": 1499,
  "totalSeconds": 1500,
  "progress": 0.0007, // 0..1
  "pomodoroCount": 0,
  "focus": 25, // configured phase lengths, in minutes
  "shortBreak": 5,
  "longBreak": 15,
  "tag": "Coding",
  "description": "ship the plugin",
  "owner": "headless", // tui | headless | none
  "pid": 12345,
  "today": { "focusSeconds": 1, "completedPomodoros": 0 },
  "dailyGoal": 8,
  "history14": [
    { "date": "2026-08-28", "focusSeconds": 1, "completedPomodoros": 0 },
  ],
  "updatedAt": "2026-08-28T11:31:59.798Z",
}
```

</details>

The file is written atomically, so a reader never sees a half-written
document. `running` is set to `false` on a clean exit — but a process killed
outright cannot write that, so judge liveness by `updatedAt` instead: the owner
rewrites this file every second, pauses included, and silence for more than a
few seconds means it is gone.

### Omarchy

The [omarchy-pomo-doro](https://github.com/dandrok/omarchy-pomo-doro) plugin
puts the countdown in the Omarchy bar, with start, pause, skip, today's stats,
and a 14-day heatmap in its popup:

```bash
omarchy plugin add https://github.com/dandrok/omarchy-pomo-doro.git --enable
```

### tmux

Add the following to your `~/.tmux.conf` (in either `status-right` or
`status-left`):

```tmux
set -g status-interval 1
set -g status-right "#(cat ~/.config/pomo-doro-nodejs/current.txt || echo '') | %a %Y-%m-%d %H:%M"
```

### Starship

Add a custom module to your `~/.config/starship.toml`:

```toml
[custom.pomodoro]
command = "cat ~/.config/pomo-doro-nodejs/current.txt 2>/dev/null"
when = "test -f ~/.config/pomo-doro-nodejs/current.txt"
```

## Tech stack

| Layer       | Choice                                                                          |
| :---------- | :------------------------------------------------------------------------------ |
| TUI         | [Ink 8](https://github.com/vadimdemedes/ink) with [React 19](https://react.dev) |
| Language    | TypeScript (strict)                                                             |
| Persistence | [conf](https://github.com/sindresorhus/conf)                                    |
| Build       | [tsup](https://tsup.egoist.dev) — single ESM bundle in `dist/`                  |
| Testing     | [Vitest](https://vitest.dev) with Testing Library                               |
| Quality     | ESLint and Prettier                                                             |

## Project structure

The project follows a modular architecture supported by TypeScript path
aliases:

```text
src/
├── cli.tsx                  Entry point and argument parsing
├── app.tsx                  Top-level app state and screen routing
├── types.ts                 Shared TypeScript types (@types)
├── core/                    Headless session engine (no React)
│   ├── session.ts           Timer, phase transitions, history, notifications
│   ├── server.ts            Control socket ownership and command dispatch
│   ├── client.ts            Liveness probe and one-shot commands
│   ├── state.ts             Atomic state.json writer
│   └── commands.ts          CLI verbs
├── terminal/
│   └── runApp.ts            Terminal lifecycle and POSIX signal handling
├── components/
│   ├── screens/             MainMenu, SessionSetup, Timer, History, Settings, ...
│   └── ui/                  Layout, ProgressBar, ActivityHeatmap, HelpOverlay, ...
├── hooks/                   useTimer, useHistory, usePomodoroSession, ...
└── utils/
    ├── config.ts            Persistent settings and history (conf)
    ├── constants.ts         Presets, icons, and color rules
    ├── helpers.ts           Pure string and time formatters
    ├── historyLogic.ts      Aggregation logic for analytics
    ├── notifications.ts     Desktop notifications and audio
    └── cliParser.ts         Argument parsing and validation
```

Path aliases: `@screens` and `@ui` for components, `@hooks` for hooks,
`@utils` for utilities, and `@types` for shared types.

## Development

```bash
# Run in development mode
npm run dev

# Run in test mode (sandbox): 6-second timers and a separate database
npm run dev:test

# Run in development mode with CLI arguments
npm run dev -- -w 45 -b 10
```

| Command                | Description                                        |
| :--------------------- | :------------------------------------------------- |
| `npm test`             | Run the unit tests                                 |
| `npm run test:watch`   | Run tests in watch mode                            |
| `npm run test:ui`      | Open the Vitest UI dashboard                       |
| `npm run typecheck`    | Type-check with `tsc --noEmit`                     |
| `npm run lint`         | Lint with ESLint                                   |
| `npm run format`       | Format the code with Prettier                      |
| `npm run format:check` | Check formatting without writing changes           |
| `npm run check`        | Run typecheck, lint, and format checks in sequence |
| `npm run build`        | Bundle the app to `dist/cli.js`                    |

Run `npm run check` and `npm test` before opening a pull request.

## CI/CD & releases

The [GitHub Actions workflow](.github/workflows/publish.yml) runs type-checking
and unit tests on every push to `main` and on every pull request. Pushing a
`v*` tag runs the same checks, builds the package, and publishes it to npm
using trusted publishing (OIDC) with provenance. Dependabot checks for
dependency updates weekly.

## Contributing

Contributions are welcome. To get started:

1. Fork the repository and create a branch from `main`.
2. Install dependencies with `npm install`.
3. Make your change and add tests for any important logic.
4. Run `npm run check` and `npm test`.
5. Open a pull request describing what changed and why.

Bug reports and feature requests are welcome in the
[issue tracker](https://github.com/dandrok/pomo_doro/issues).

## License

Released under the [MIT License](./LICENSE). © 2026 dandrok.
