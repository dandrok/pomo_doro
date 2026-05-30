# Pomo Doro

A sleek, modular Pomodoro timer for your terminal, built with React, Ink, and TypeScript.

https://github.com/user-attachments/assets/a78c5aa7-417d-4f7e-967d-2158804bc5e7

## Features

- **TUI Interface**: Clean terminal UI with big text and progress bars.
- **Smart & Customizable Sessions**: Cycle between Work and Breaks automatically with built-in presets, or create custom intervals using the interactive setup wizard.
- **Productivity Dashboard**: Track your total focus time and see a 7-day history chart.
- **Modular Architecture**: Built with custom React hooks and decoupled components.
- **OS Notifications & Audio Alerts**: Native desktop notifications and sound alerts when sessions complete (supports Linux, macOS, and Windows).
- **Persistence**: Remembers your progress and allows you to resume sessions.
- **Development Sandbox**: Dedicated test mode with ultra-short timers for rapid testing.

## Installation & Usage

### Global Installation (Recommended)

You can install Pomo Doro globally and run it from anywhere in your terminal:

```bash
npm install -g pomo-doro-tui
```

After installation, simply run:

```bash
pomo
```

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

| Key         | Action                                                             |
| :---------- | :----------------------------------------------------------------- |
| `p`         | Pause timer                                                        |
| `r`         | Resume timer                                                       |
| `q`         | Quit application (when timer is not running)                       |
| `b` / `Esc` | Go back to previous menu (from History, Preset, or Wizard screens) |

### Custom Preset Wizard Controls

| Key              | Action                                                          |
| :--------------- | :-------------------------------------------------------------- |
| `Up` / `Down`    | Navigate between fields (Focus, Short Break, Long Break, Start) |
| `Left` / `Right` | Decrease / Increase the active duration value                   |
| `Enter`          | Advance to the next field, or start session (when on Start)     |

## Project Structure

- `src/types.ts`: Centralized application-wide TypeScript types.
- `src/hooks/`: Core React hooks for time and history management.
- `src/components/`: Modular React components for UI rendering (e.g., `ProgressBar`, `TimerView`, `History`).
- `src/utils/`: Shared configurations, constants, formatting helpers, and notification services.
  - `config.ts`: Local session and productivity history persistence.
  - `constants.ts`: Layout colors, icons, and timer settings.
  - `helpers.ts`: Pure formatting and state utilities.
  - `historyLogic.ts`: Productivity statistic calculations.
  - `notifications.ts`: Cross-platform OS notification and audio alerts.

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

# Build the project
npm run build
```

## CI/CD & Releases

This project uses **GitHub Actions** for automated quality control:

- **On Push/PR**: Automatically runs type-checking and unit tests.
- **On Release**: Automatically builds and publishes the new version to the NPM registry when a GitHub Release is created.

## License

ISC
