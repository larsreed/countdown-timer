# Countdown Timer (Single Page)

This project is a single-page timer built with only HTML, CSS, and JavaScript.

## Requirements covered

- Runs directly in Edge and Chrome on Windows (no extra software needed).
- One webpage UI split vertically:
  - Top 5/6: large countdown timer (`MM:SS`)
  - Bottom 1/6: control panel
- Control panel includes separate numeric inputs for minutes and seconds and a warning-threshold seconds input.
- Control panel includes preset quick-start buttons that set timer/warning values, reset, start, and request fullscreen.
- Control panel includes a `ding!` button that plays the alert sound (`ring.mp3`, or the 3-beep fallback) on demand.
- Works in normal browser mode and fullscreen mode.

## Configuration
- Configurable colors in CSS only (`styles.css` variables):
  - top panel background (`--top-bg`)
  - bottom panel background (`--bottom-bg`)
  - text (`--text-color`)
- Initial colors:
  - top panel: bright green (`#39ff14`)
  - bottom panel: black (`#000000`)
  - text: white (`#ffffff`)
- When remaining time is greater than 0 but lower than the warning threshold:
  - top panel background turns bright red
  - a triangular warning icon with `!` appears to the right of the timer
- When the timer reaches zero:
  - top panel background turns black
  - `ring.mp3` plays
  - if `ring.mp3` cannot play, a fallback of 3 short beeps plays
  - warning icon remains visible and blinks
  - countdown continues into negative time (for example, `-00:01`, `-00:02`)

## Files

- `index.html` - page structure
- `styles.css` - layout and styles
- `script.js` - timer logic, fullscreen, and alert playback
- `ring.mp3` - alert sound played at zero

## Run

Open `index.html` in Edge or Chrome.

Examples from PowerShell:

```powershell
Start-Process msedge.exe "C:\UTV\timer\index.html"
Start-Process chrome.exe "C:\UTV\timer\index.html"
```

## License

This project is licensed under the GNU Lesser General Public License, version 3. See [LICENSE](LICENSE) for the full text.


