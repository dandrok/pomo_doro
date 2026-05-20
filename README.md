# Pomo Doro

A sleek, modular Pomodoro timer for your terminal, built with React, Ink, and TypeScript.

![demo](./docs/demo.mp4)

## Features

- TUI Interface: Clean terminal UI with big text and progress bars.
- Modular Architecture: Built with custom React hooks and decoupled components.
- Smart Sessions: Automatically switches between Work, Short Breaks, and Long Breaks.
- Persistence: Remembers your progress and allows you to resume sessions.

## Installation & Usage

To get started locally:

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

| Key | Action |
| :--- | :--- |
| p | Pause timer |
| r | Resume timer |
| q | Quit application |

## Project Structure

The project is structured for readability and modularity:

- src/hooks/: Core logic for time management (e.g., useTimer).
- src/components/: Modular UI components (e.g., ProgressBar, TimerView).
- src/constants.ts: Centralized configuration for durations, colors, and symbols.
- src/helpers.ts: Shared utility functions.
- src/config.ts: Handles local session persistence.

## Development

```bash
# Run in development mode
npm run dev

# Run type checking
npm run typecheck

# Lint the code
npm run lint
```

## License

ISC
