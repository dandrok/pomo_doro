# Pomo Doro

A sleek, modular Pomodoro timer for your terminal, built with React, Ink, and TypeScript.

https://github.com/user-attachments/assets/a78c5aa7-417d-4f7e-967d-2158804bc5e7

## Features

- **TUI Interface**: Clean terminal UI with big text and progress bars.
- **Productivity Dashboard**: Track your total focus time and see a 7-day history chart.
- **Modular Architecture**: Built with custom React hooks and decoupled components.
- **Smart Sessions**: Automatically cycles between Work, Short Breaks, and Long Breaks.
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

| Key | Action                           |
| :-- | :------------------------------- |
| p   | Pause timer                      |
| r   | Resume timer                     |
| q   | Quit application                 |
| b   | Back to menu (from History view) |

## Project Structure

- `src/hooks/`: Core logic for time management (e.g., `useTimer`).
- `src/components/`: Modular UI components (e.g., `ProgressBar`, `TimerView`, `History`).
- `src/constants.ts`: Centralized configuration for durations, colors, and symbols.
- `src/helpers.ts`: Shared utility functions and types.
- `src/config.ts`: Handles local session and history persistence.

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
