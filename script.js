(function () {
  const timerPanel = document.getElementById("timer-panel");
  const timerContent = document.querySelector(".timer-content");
  const timeDisplay = document.getElementById("time-display");
  const warningIcon = document.getElementById("warning-icon");

  const minutesInput = document.getElementById("minutes-input");
  const secondsInput = document.getElementById("seconds-input");
  const warningSecondsInput = document.getElementById("warning-seconds-input");

  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const dingBtn = document.getElementById("ding-btn");
  const presetButtons = document.getElementById("preset-buttons");
  const ringAudio = new Audio("ring.mp3");
  ringAudio.preload = "auto";

  let totalSeconds = 5 * 60;
  let timeLeft = totalSeconds;
  let timerId = null;
  let hasPlayedDing = false;
  let fitScheduled = false;

  renderTime(timeLeft);
  updateVisualState();

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  dingBtn.addEventListener("click", playDing);

  minutesInput.addEventListener("change", applyConfiguredTime);
  secondsInput.addEventListener("change", applyConfiguredTime);
  warningSecondsInput.addEventListener("change", () => {
    warningSecondsInput.value = clampWarningSeconds(warningSecondsInput.value);
    updateVisualState();
  });
  if (presetButtons) {
    presetButtons.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-total-seconds][data-warning-seconds]");
      if (!btn) {
        return;
      }

      const totalSecondsFromPreset = Number.parseInt(btn.dataset.totalSeconds, 10);
      const warningSecondsFromPreset = Number.parseInt(btn.dataset.warningSeconds, 10);
      if (Number.isNaN(totalSecondsFromPreset) || Number.isNaN(warningSecondsFromPreset)) {
        return;
      }

      applyPreset(totalSecondsFromPreset, warningSecondsFromPreset);
    });
  }

  document.addEventListener("fullscreenchange", () => {
    syncFullscreenButtonText();
    scheduleTimerFit();
  });
  window.addEventListener("resize", scheduleTimerFit);

  function clampMinutes(rawMinutes) {
    const parsed = Number.parseInt(rawMinutes, 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }

    return Math.min(999, Math.max(0, parsed));
  }

  function clampSeconds(rawSeconds) {
    const parsed = Number.parseInt(rawSeconds, 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }

    return Math.min(59, Math.max(0, parsed));
  }

  function clampWarningSeconds(rawSeconds) {
    const parsed = Number.parseInt(rawSeconds, 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }

    return Math.min(9999, Math.max(0, parsed));
  }

  function applyConfiguredTime() {
    const mins = clampMinutes(minutesInput.value);
    const secs = clampSeconds(secondsInput.value);
    minutesInput.value = mins;
    secondsInput.value = secs;
    totalSeconds = mins * 60 + secs;
    timeLeft = totalSeconds;
    hasPlayedDing = false;
    renderTime(timeLeft);
    updateVisualState();
  }

  function applyPreset(totalSecondsValue, warningSecondsValue) {
    pauseTimer();

    const safeTotalSeconds = Math.max(0, totalSecondsValue);
    const minutesFromPreset = Math.floor(safeTotalSeconds / 60);
    const secondsFromPreset = safeTotalSeconds % 60;

    minutesInput.value = clampMinutes(minutesFromPreset);
    secondsInput.value = clampSeconds(secondsFromPreset);
    warningSecondsInput.value = clampWarningSeconds(warningSecondsValue);

    applyConfiguredTime();
    startTimer();
    enterFullscreen();
  }

  function renderTime(secondsLeft) {
    const isNegative = secondsLeft < 0;
    const absSeconds = Math.abs(secondsLeft);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = isNegative ? "-" : "";
    timeDisplay.textContent = `${sign}${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    scheduleTimerFit();
  }

  function startTimer() {
    if (timerId !== null) {
      return;
    }

    timerId = window.setInterval(() => {
      timeLeft -= 1;
      renderTime(timeLeft);
      updateVisualState();

      if (timeLeft === 0) {
        if (!hasPlayedDing) {
          playDing();
          hasPlayedDing = true;
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function resetTimer() {
    pauseTimer();
    applyConfiguredTime();
  }

  function playDing() {
    ringAudio.currentTime = 0;
    ringAudio.play().catch(function () {
      playFallbackBeeps(3);
    });
  }

  function updateVisualState() {
    const warningThreshold = clampWarningSeconds(warningSecondsInput.value);
    warningSecondsInput.value = warningThreshold;

    if (timeLeft <= 0) {
      timerPanel.style.backgroundColor = "#000000";
      warningIcon.classList.add("visible");
      // Blink only during the first minute past zero, then hold steady.
      warningIcon.classList.toggle("blinking", timeLeft > -60);
      scheduleTimerFit();
      return;
    }

    if (warningThreshold > 0 && timeLeft < warningThreshold) {
      timerPanel.style.backgroundColor = "#ff2a2a";
      warningIcon.classList.add("visible");
      warningIcon.classList.remove("blinking");
      scheduleTimerFit();
      return;
    }

    timerPanel.style.backgroundColor = "";
    warningIcon.classList.remove("visible");
    warningIcon.classList.remove("blinking");
    scheduleTimerFit();
  }

  function scheduleTimerFit() {
    if (fitScheduled) {
      return;
    }

    fitScheduled = true;
    window.requestAnimationFrame(() => {
      fitScheduled = false;
      fitTimerContent();
    });
  }

  function fitTimerContent() {
    if (!timerContent) {
      return;
    }

    timerContent.style.transform = "scale(1)";

    const panelRect = timerPanel.getBoundingClientRect();
    const contentRect = timerContent.getBoundingClientRect();
    const horizontalPadding = 16;
    const verticalPadding = 16;
    const availableWidth = Math.max(1, panelRect.width - horizontalPadding);
    const availableHeight = Math.max(1, panelRect.height - verticalPadding);
    const widthScale = availableWidth / Math.max(1, contentRect.width);
    const heightScale = availableHeight / Math.max(1, contentRect.height);
    const scale = Math.min(1, widthScale, heightScale);

    timerContent.style.transform = `scale(${scale})`;
  }

  function playFallbackBeeps(repeatCount) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const audioCtx = new AudioCtx();
    const startAt = audioCtx.currentTime;
    const spacingSeconds = 0.28;
    const beepDurationSeconds = 0.12;

    audioCtx.resume().catch(function () {
      // No-op: context might already be running.
    });

    for (let i = 0; i < repeatCount; i += 1) {
      const beepStart = startAt + i * spacingSeconds;
      const beepEnd = beepStart + beepDurationSeconds;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, beepStart);

      gain.gain.setValueAtTime(0.0001, beepStart);
      gain.gain.exponentialRampToValueAtTime(0.2, beepStart + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, beepEnd);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(beepStart);
      osc.stop(beepEnd);
    }

    const closeDelayMs = Math.ceil((repeatCount * spacingSeconds + 0.25) * 1000);
    window.setTimeout(function () {
      audioCtx.close().catch(function () {
        // No-op: context may already be closed.
      });
    }, closeDelayMs);
  }

  function syncFullscreenButtonText() {
    fullscreenBtn.textContent = document.fullscreenElement ? "Exit Fullscreen" : "Fullscreen";
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      document.exitFullscreen().catch(function () {
        // No-op: ignore failures caused by transient browser state.
      });
    }
  }

  function enterFullscreen() {
    if (document.fullscreenElement) {
      return;
    }

    document.documentElement.requestFullscreen().catch(function () {
      // No-op: browser or user policy can block fullscreen requests.
    });
  }
})();






