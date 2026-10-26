# Agent guide

## Project structure

- This is a dependency-free, single-page browser app. `index.html` loads `styles.css` and `script.js` directly; there is no build step or package manager.
- `script.js` contains timer, preset, fullscreen, and alert-audio behavior in a single IIFE. Its DOM lookups rely on the IDs/classes in `index.html`.
- Preset values are declared in `index.html` as `data-total-seconds`, `data-warning-seconds`, and `data-jump-seconds` attributes and handled by the `#preset-buttons` delegated click listener.
- `styles.css` defines theme colors as `:root` custom properties. Timer warning/expired states are updated by `updateVisualState()` in JavaScript.
- `ring.mp3` is the primary alert sound; `script.js` falls back to Web Audio beeps if playback fails.

## Run and validate

- Open `index.html` directly in Edge or Chrome. For the documented PowerShell launch commands, see `README.md`.
- There is no automated build or test command. Check behavior in the browser, including presets, warning/zero states, audio, and fullscreen.

## Change conventions

- Keep the app's static-file structure and avoid adding dependencies or a build system for changes that fit the existing implementation.
- When changing controls or presets, keep the HTML IDs/data attributes in sync with the selectors and event handling in `script.js`.
- Keep configurable theme colors in the `:root` variables in `styles.css`; timer-state colors are currently set by `updateVisualState()` in `script.js`.
