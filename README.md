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

The project follows a clean, modular architecture supported by TypeScript path aliases:

- `src/cli.tsx`: The CLI entry point.
- `src/app.tsx`: Main app container.
- `src/types.ts`: Centralized TypeScript definitions. Mapped via `@types`.
- `src/components/`: Reusable React components. Mapped via `@screens` and `@ui`:
  - `screens/`: High-level views (e.g., `MainMenu`, `Router`, `Timer`, `CustomPresetWizard`, `History`).
  - `ui/`: Structure and display elements (e.g., `Layout`, `ProgressBar`, `DailyBarChart`, `HeaderBar`, `FooterBar`).
- `src/hooks/`: Custom React hooks (e.g., `useTimer`, `useHistory`). Mapped via `@hooks`.
- `src/utils/`: Utilities, configs, and side-effects. Mapped via `@utils`:
  - `config.ts`: Conf-based settings & history persistence.
  - `constants.ts`: Timer presets, icons, and color rules.
  - `helpers.ts`: Pure string and time formatters.
  - `historyLogic.ts`: Aggregation logic for analytics.
  - `notifications.ts`: Desktop notification & audio controller.

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
