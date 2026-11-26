# Changelog

All notable changes to Pomo Doro are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- git-cliff: end of header -->

## [1.18.0] - 2026-11-25

### ✨ Features
- Add version command and update readme
### 📚 Documentation
- Update readme and add proper license
### 📦 Dependencies
- **deps-dev**: Bump the dependencies group across 1 directory with 4 updates
### ⚙️ CI/CD
- Fail publish when the tag does not match package.json
## [1.17.1] - 2026-10-30

### 📚 Documentation
- Refresh demo.gif with fullscreen TUI walkthrough and add tape specification
## [1.17.0] - 2026-10-30

### ✨ Features
- **ui**: Take over terminal alternate screen buffer and restore on exit
### 🐛 Bug Fixes
- **core**: Allow disabling termination signal handling in serve for TUI ownership
### 🛠 Refactoring
- **ui**: Adopt native Ink 8 alternateScreen and propagate signal exit codes
### 🧹 Maintenance
- Update readme
- Bump dependencies to latest versions and migrate to Ink 8 / Vitest 5
## [1.16.0] - 2026-08-28

### ✨ Features
- Single-owner session engine with a control socket
### 🐛 Bug Fixes
- Address CodeRabbit review findings
- Address second review pass
- Close a race that could recreate current.txt after a session ends
- Make stopping a session terminal
- Let the app exit while it owns a session
- Declare the repository so provenance verification passes
### 📚 Documentation
- Document the CLI verbs, state.json, and the Omarchy plugin
### ⚙️ CI/CD
- Publish to npm over OIDC instead of a token
## [1.15.0] - 2026-08-03

### ✨ Features
- Add contextual help overlay and responsive footer controls
### 📚 Documentation
- Clarify help overlay is scoped to screens with a footer
## [1.14.1] - 2026-06-22

### 🐛 Bug Fixes
- Bump version to v1.14.1 and update packages
### 🛠 Refactoring
- Optimize status file path calculation and correct README paths
## [1.14.0] - 2026-06-12

### ✨ Features
- Tmux and status bar integration
### 🛠 Refactoring
- Use fs promises writefiles insted insted of try and catch
## [1.13.0] - 2026-06-09

### ✨ Features
- Add the theme support
### 🛠 Refactoring
- Few fixes and improvements
## [1.12.0] - 2026-06-08

### ✨ Features
- Add manual transition mode toggle, update tests, and readme, bump package version
### 🛠 Refactoring
- Small adjustments
## [1.11.0] - 2026-06-07

### ✨ Features
- **dashcoard**: Implement activity heatmap, stack var chart, and responsive layout in history
### 🐛 Bug Fixes
- Small fixes by coderabbit
### 🛠 Refactoring
- Strict clamping valiation
### 🧹 Maintenance
- Bump package to v1.11.0
## [1.10.0] - 2026-06-06

### ✨ Features
- Fix session tracing and implement time tracking
### 🛠 Refactoring
- Small changes after code reveiw by coderabbit
## [1.9.1] - 2026-06-05

### 🛠 Refactoring
- Small ui change in footer bar to make sure that navigation bar is more user frindly, bump package to v1.9.1
### 🧹 Maintenance
- Fix github actions warning by bumping node to v24 and checkout to v6
- Update the setup-node to v6
- Update eslint.config to support be a ts file and install jiti as a dev dependency
- Eslint format
## [1.9.0] - 2026-06-05

### ✨ Features
- Implement setting view to set daily pomodoros goal, simlyfy the footer by removing q button support, small refactor
### 🧹 Maintenance
- V1.9.0 package bump
## [1.8.0] - 2026-06-04

### ✨ Features
- Tag tracking, setup wizard refactor, and some other small changes
## [1.7.0] - 2026-06-03

### ✨ Features
- Handle skip and reset pomodors
### 🛠 Refactoring
- Extract usePomodoroSession hook & refine key bindings
### 🧹 Maintenance
- Update readme
## [1.6.0] - 2026-06-03

### ✨ Features
- Add custom session duration via cli args
### 🧹 Maintenance
- Update readme
- V1.6.0 bump package
## [1.5.0] - 2026-06-02

### ✨ Features
- Toggle to mute and silience notifications
### 🧹 Maintenance
- Ts types over interfaces
- Readme update
- V1.5.0 bump package
## [1.4.1] - 2026-05-31

### 🧹 Maintenance
- V1.4.1 bump, update readme and remove unused package
## [1.4.0] - 2026-05-30

### ✨ Features
- Implement custom pomodor time and make some UI adjustments, make sure user can back from each part of the app
### 🛠 Refactoring
- Restructure component hierarchy, add router for clean component routing and layout, rename components, tsconfig changes
- Add @types as a path alias in ts/vitest and update files across the app
### 🧹 Maintenance
- V1.4.0 bump and readme update
## [1.3.1] - 2026-05-29

### 🧹 Maintenance
- Update README file
- V1.3.1 bump package version
## [1.3.0] - 2026-05-29

### ✨ Features
- Playing sound and displaying notification to inform user about breaks
### 🛠 Refactoring
- Format with prettier script
- Folder structure improvemnet - move from src into utils, created shared types file
### 🧹 Maintenance
- Bump version to v1.3.0
## [1.2.0] - 2026-05-26

### ✨ Features
- Add about section with current version and other infos
### 🛠 Refactoring
- Ignore build inputs in dist, move package json imports to constant file
### 🧹 Maintenance
- Bump version to 1.2.0
## [1.1.1] - 2026-05-24

### ✨ Features
- Initial setup, simple menu and progress bar implemented
- Timer
- Pause and resume the timer
- Timer loop with short and long break - WIP
- Small setup for history session
- Component for resume status
- Add basic conf setup to add the pomo count to the conf
- Session functionality with the new config
- Impove exit functionality and implement keyboard for q quiting, additional lint formating
- UI status improvements
- UI improvements - timer and mode state color change
- Move next session type logic to helpers
- Add history state, simple data dashcoards, and test sandbox for local
### 🐛 Bug Fixes
- Set default block font
- Update shebang for global execution and hump to v0.0.3
- Include node types
### 🛠 Refactoring
- Set p to set isPaused to true and r to set it to false
- Small ui changes
- Constant for magic numbers
- Remove .1 value and make sure all the break times are set correctly
- Update running screen component
- Move objects to constants
- Move helper to helpers file and components folder to simgle components file
- Extract useTimer hook and modularize timer components
- Small improvemnt
- Implement useHistory hook with buffered persisance and full test coverage
### 🧪 Testing
- Setup vitest and add tests for core logic
### 📦 Dependencies
- Implement modern building with tsup and clean up imports
### 🧹 Maintenance
- Commit readme
- Add demo gif
- Update correct gif file
- Remove not working q button from running screen
- Add eslint and prettier setup
- Some extra todo for later
- Remove font select
- Remove commented code
- Install conf lib
- Fix the typo
- Remove comments
- Update readme
- Update version to 0.0.2
- Update demo vid
- Update demo vid
- Delete docs filder with mp4 file and clean readme file
- Prepare for v1 relase and npm publication
- Update readme with tests commands
- Remove 0.1s pomo created for testing and bump package to v1.0.2
- Setup ci/cd for npm publish
