/*
  This file connects the custom HTML controls (play/pause button,
  progress bar, volume slider, loop checkbox) to the real <audio>
  element. The browser's default audio controls are hidden and
  rebuilt from scratch here so the player matches the site's calm,
  minimal visual style instead of looking like a generic browser
  widget dropped onto the page.
*/

const audio = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const playPauseImg = document.getElementById("play-pause-img");
const progressBar = document.getElementById("progress-bar");
const progressBarFill = document.getElementById("progress-bar-fill");
const currentTimeLabel = document.getElementById("current-time");
const durationLabel = document.getElementById("duration-time");
const volumeSlider = document.getElementById("volume-slider");
const loopCheckbox = document.getElementById("loop-checkbox");

// Play/Pause toggles playback and swaps the icon so the button
// always reflects current state. This matters in a music context
// where users glance at the player rather than watch it closely —
// the icon needs to communicate state at a glance.
playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
    playPauseImg.alt = "Pause";
  } else {
    audio.pause();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
    playPauseImg.alt = "Play";
  }
});

// Progress bar and time labels update continuously during playback,
// giving passive feedback without requiring the user to interact.
audio.addEventListener("timeupdate", () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBarFill.style.width = `${percent}%`;
  currentTimeLabel.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  durationLabel.textContent = formatTime(audio.duration);
});

// Clicking anywhere on the progress bar seeks to that point,
// rather than only allowing playback to move forward passively.
progressBar.addEventListener("click", (e) => {
  const barWidth = progressBar.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / barWidth) * audio.duration;
});

volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

loopCheckbox.addEventListener("change", () => {
  audio.loop = loopCheckbox.checked;
});

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

/*
  Study Timer, the extra interactive feature required beyond the
  base player. Deliberately kept independent of the audio track's
  length: a study session's duration is a personal choice, not
  something that should be dictated by how long an ambient loop
  happens to run. This also means the same short audio file can
  loop safely under a 50-minute session without needing multiple
  audio files of different lengths.
*/

const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("timer-start-btn");
const pauseBtn = document.getElementById("timer-pause-btn");
const resetBtn = document.getElementById("timer-reset-btn");
const modeButtons = document.querySelectorAll(".timer-mode-btn");

let totalSeconds = 25 * 60;
let timerInterval = null;

function updateTimerDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  timerDisplay.textContent = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Guards against multiple intervals stacking if Start is clicked
// repeatedly, which would otherwise make the countdown run too fast.
startBtn.addEventListener("click", () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
});

pauseBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  const activeMode = document.querySelector(".timer-mode-btn.active");
  totalSeconds = Number(activeMode.dataset.minutes) * 60;
  updateTimerDisplay();
});

// Mode buttons let the user pick a preset length. Switching modes
// mid-countdown resets the timer to avoid a confusing mismatch
// between the selected mode and the time shown.
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    clearInterval(timerInterval);
    timerInterval = null;
    totalSeconds = Number(btn.dataset.minutes) * 60;
    updateTimerDisplay();
  });
});