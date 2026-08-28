# Pomo Doro

A sleek, modular Pomodoro timer for your terminal, built with React, Ink, and TypeScript.
![Pomo Doro Demo](./assets/demo.gif)

## Features

- **TUI Interface**: Clean terminal UI with big text and progress bars.
- **Smart & Customizable Sessions**: Cycle between Work and Breaks automatically with built-in presets, or create custom intervals using the interactive setup wizard.
- **Manual Transition Mode**: Toggle (`a`) auto/manual transition mode to prevent timers from running while away from your keyboard, complete with clear UI prompts.
- **Productivity Dashboard & Daily Goals**: Track your total focus time, set daily Pomodoro goals, configure your daily focus time goal, and see a 15-week history chart.
- **Interactive Settings Menu**: Dynamically configure your daily goals and toggle OS notifications on the fly.
- **Analytics Dashboard**: GitHub-style activity heatmaps, horizontal stacked bar charts, and productivity tracking over 15 weeks.
- **Appearance Customizer**: Change the clock's font style and color theme in real-time using a dedicated, interactive preview screen.
- **Contextual Help Overlay**: On screens with a footer control bar (Timer, Settings, Session Setup, About, History), press `h` to open a bordered help panel listing every available key alongside an arrow (`──▶`) pointing to what it does, without interrupting the running timer.
- **Responsive Layout**: Gracefully adapts between side-by-side and vertical stacked layouts depending on terminal window size. The footer control bar itself collapses to bare `[key]` shortcuts (dropping labels) below ~70 columns to avoid crowding.
- **System Integration**: Cross-platform system notifications with sound alerts using `node-notifier` and `play-sound` (supports Linux, macOS, and Windows).
- **Tmux & Status Bar Integration**: Automatically exports the active timer state to `~/.config/pomo-doro-nodejs/current.txt` on every tick, perfect for embedding in `tmux`, `waybar`, or `polybar` modules.
- **Runs Without a Terminal**: `pomo start` runs the clock detached, so a session survives closing the window it was started in.
- **Omarchy Bar Widget**: A companion [Omarchy plugin](https://github.com/dandrok/omarchy-pomo-doro) shows and controls the very same session from the desktop bar.
- **Persistence**: Remembers your progress and allows you to resume sessions.
- **Development Sandbox**: Dedicated test mode with ultra-short timers for rapid testing.

## Installation & Usage

### Global Installation (Recommended)

You can install Pomo Doro globally and run it from anywhere in your terminal:

```bash
npm install -g pomo-doro-tui
```

After installation, run `pomo` to start the interactive menu, or launch a custom session directly using command-line options:

```bash
# Start with interactive menu
pomo

# Start immediately with a 50-minute work session and a 10-minute break
pomo --work 50 --break 10
```

#### CLI Options

| Option                   | Alias | Description                                                          |
| :----------------------- | :---- | :------------------------------------------------------------------- |
| `--work <minutes>`       | `-w`  | Set custom focus session duration (minutes)                          |
| `--break <minutes>`      | `-b`  | Set custom short break duration (minutes)                            |
| `--long-break <minutes>` | `-l`  | Set custom long break duration (minutes, defaults to 3x short break) |
| `--tag <string>`         | `-t`  | Set the tag/category name                                            |
| `--description <string>` | `-d`  | Set an optional description for the session                          |
| `--goal <number>`        | `-g`  | Set your Daily Pomodoro Goal                                         |
| `--help`                 | `-h`  | Show help details                                                    |

> [!NOTE]
> The `--work` (or `-w`) option is required if you want to customize break durations via the command line. When you use CLI arguments to start a timer, the main menu is bypassed, and the session begins immediately.

### Local Development

Or if you want to run from source:

```bash
# Clone the repository
git clone https://github.com/dandrok/pomo_doro.git
cd pomo_doro

# Install dependencies
npm install

# Run the app
npm run dev
```

## Controls

### General & Timer Controls

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

### Custom Preset & Settings Controls

| Key              | Action                                                                              |
| :--------------- | :---------------------------------------------------------------------------------- |
| `Up` / `Down`    | Navigate between fields (Focus, Short Break, Long Break, Tag, Description, Start)   |
| `Left` / `Right` | Decrease / Increase the active duration value, or cycle between default/recent tags |
| `Typing`         | Enter custom tags and descriptions on their respective fields                       |
| `Enter`          | Advance to the next field, or start session (when on Start)                         |

## Command Line

Running `pomo` with no arguments opens the terminal UI. It also takes verbs,
so a session can be started and driven without one:

| Command                            | Does                                       |
| :--------------------------------- | :----------------------------------------- |
| `pomo start [-w -b -l -t -d]`      | Start a pomodoro with no terminal attached |
| `pomo status [--json]`             | Print the current session                  |
| `pomo pause` / `resume` / `toggle` | Control the running session                |
| `pomo skip`                        | Skip to the next phase                     |
| `pomo reset`                       | Restart the current phase                  |
| `pomo stop`                        | End the running session                    |

### One session, many views

Exactly one process runs the clock at a time. It claims that role by binding a
unix socket in `$XDG_RUNTIME_DIR`, so whoever starts first owns the timer and
everything else attaches to it:

```
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

## Status Bar Integrations

The timer writes two files on every tick, both next to `config.json` in
`~/.config/pomo-doro-nodejs/`:

- `current.txt` — one line of text, e.g. `◈ 24:59`
- `state.json` — the full session state, for anything that wants more than a label

### Omarchy

The [omarchy-pomo-doro](https://github.com/dandrok/omarchy-pomo-doro) plugin
puts the countdown in the Omarchy bar, with start, pause, skip, today's stats,
and a 14-day heatmap in its popup:

```bash
omarchy plugin add https://github.com/dandrok/omarchy-pomo-doro.git --enable
```

### state.json

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

The file is written atomically, so a reader never sees a half-written
document. `running` is set to `false` on a clean exit — but a process killed
outright cannot write that, so judge liveness by `updatedAt` instead: the
owner rewrites this file every second, pauses included, and silence for more
than a few seconds means it is gone.

### Tmux

Add the following to your `~/.tmux.conf` (in either `status-right` or `status-left`):

```tmux
set -g status-interval 1
set -g status-right "#(cat ~/.config/pomo-doro-nodejs/current.txt || echo '') | %a %Y-%m-%d %H:%M"
```

### Zsh (Starship)

Add a custom module to your `~/.config/starship.toml`:

```toml
[custom.pomodoro]
command = "cat ~/.config/pomo-doro-nodejs/current.txt 2>/dev/null"
when = "test -f ~/.config/pomo-doro-nodejs/current.txt"
```

## Project Structure

The project follows a clean, modular architecture supported by TypeScript path aliases:

- `src/cli.tsx`: The CLI entry point.
- `src/app.tsx`: Main app container.
- `src/types.ts`: Centralized TypeScript definitions. Mapped via `@types`.
- `src/core/`: The session engine, with no React in it, so a process with no terminal can run the clock:
  - `state.ts`: The `state.json` contract, written atomically each tick.
  - `session.ts`: The timer itself - phase transitions, history, notifications.
  - `server.ts`: Ownership of the control socket and command dispatch.
  - `client.ts`: Liveness probe and one-shot commands.
  - `commands.ts`: The CLI verbs.
- `src/components/`: Reusable React components. Mapped via `@screens` and `@ui`:
  - `screens/`: High-level views (e.g., `MainMenu`, `TimeSelect`, `SessionSetup`, `History`, `Settings`, `Appearance`, `Timer`, `About`, `Resume`, `Router`).
  - `ui/`: Structure and display elements (e.g., `Layout`, `ProgressBar`, `ActivityHeatmap`, `StackedBarChart`, `HeaderBar`, `FooterBar`, `HelpOverlay`, `FormRow`).
- `src/hooks/`: Custom React hooks (e.g., `useTimer`, `useHistory`, `usePomodoroSession`, `useSessionSetup`, `useHelp`). Mapped via `@hooks`.
- `src/utils/`: Utilities, configs, and side-effects. Mapped via `@utils`:
  - `config.ts`: Conf-based settings & history persistence.
  - `constants.ts`: Timer presets, icons, and color rules.
  - `helpers.ts`: Pure string and time formatters.
  - `historyLogic.ts`: Aggregation logic for analytics.
  - `notifications.ts`: Desktop notification & audio controller.
  - `cliParser.ts`: Command-line arguments parser and validator.

## Development

```bash
# Run in development mode
npm run dev

# Run in Test Mode (Sandbox)
# Uses 6-second timers and a separate database
npm run dev:test

# Run tests
npm test

# Run tests with Vitest UI dashboard
npm run test:ui

# Format the code (Prettier)
npm run format

# Run full QA check (Typecheck, Lint, Format)
npm run check

# Build the project
npm run build
```

## CI/CD & Releases

This project uses **GitHub Actions** for automated quality control:

- **On Push/PR**: Automatically runs type-checking and unit tests.
- **On Release**: Automatically builds and publishes the new version to the NPM registry when a GitHub Release is created.

## License

ISC
