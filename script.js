// ---------- ERROR SAFETY NET ----------
// If anything throws, show it on screen instead of failing silently —
// this is what "nothing happens when I click" usually hides.
window.onerror = function (message) {
  const statusEl = document.getElementById("status");
  if (statusEl) {
    statusEl.textContent = "Error: " + message;
    statusEl.style.color = "#ff8080";
  }
};

// ---------- SOUND SETUP ----------
if (typeof Tone === "undefined") {
  document.getElementById("status").textContent =
    "Tone.js didn't load — check your internet connection and refresh.";
  throw new Error("Tone.js failed to load from unpkg");
}

const synth = new Tone.PolySynth().toDestination();
const scale = ["C4", "D4", "E4", "G4", "A4"];

// ---------- WHAT THIS PROTOTYPE TESTS ----------
// This is the linear baseline for the Information Design area: flowers
// spawn at an EVEN interval, so garden fullness = % of time elapsed,
// no acceleration or staging. The bar below the garden makes that
// linear relationship explicit and literal. The garden itself stays
// blurred throughout the study phase — visible as soft blooming shapes,
// but not yet "in focus" as a playable instrument — until the bar hits
// 100%, at which point it bursts and the garden is revealed in focus,
// marking a clear, single transition from waiting to playing.
const STUDY_DURATION_MS = 8000; // sped up for testing; use 25 * 60 * 1000 for a real session
const FLOWER_COUNT = 10;
const colors = ["#e08ab3", "#f2c14e", "#7dd87d", "#8ab6e0", "#c98ae0"];

const status = document.getElementById("status");
const gardenWrap = document.getElementById("garden-wrap");
const garden = document.getElementById("garden");
const barFill = document.getElementById("bar-fill");

function spawnFlower() {
  const flower = document.createElement("div");
  flower.className = "field-flower";

  const x = Math.random() * (window.innerWidth - 40) + 20;
  const y = Math.random() * (window.innerHeight - 120) + 20; // keep clear of the bar
  flower.style.left = x + "px";
  flower.style.top = y + "px";

  const color = colors[Math.floor(Math.random() * colors.length)];
  flower.style.background = color;
  flower.style.color = color;
  flower.dataset.note = scale[Math.floor(Math.random() * scale.length)];

  garden.appendChild(flower);
  requestAnimationFrame(function () {
    flower.classList.add("grown");
  });
}

function studyPhase() {
  // Even spawn interval — the defining trait of this prototype
  const interval = STUDY_DURATION_MS / FLOWER_COUNT;
  let spawned = 0;
  const spawnTimer = setInterval(function () {
    spawnFlower();
    spawned++;
    if (spawned >= FLOWER_COUNT) {
      clearInterval(spawnTimer);
    }
  }, interval);

  // Bar fills at a constant rate, matching the flowers' pace exactly
  const startTime = performance.now();
  function updateBar() {
    const elapsed = performance.now() - startTime;
    const percent = Math.min(100, (elapsed / STUDY_DURATION_MS) * 100);
    barFill.style.width = percent + "%";

    if (elapsed < STUDY_DURATION_MS) {
      requestAnimationFrame(updateBar);
    } else {
      explodeBar();
    }
  }
  requestAnimationFrame(updateBar);
}

// ---------- THE REVEAL MOMENT ----------
function explodeBar() {
  status.textContent = "";
  barFill.classList.add("exploding");

  // Remove the blur in the same moment the bar bursts, so the two
  // effects read as one single event rather than two separate ones
  gardenWrap.classList.add("revealed");

  // Wait for the burst animation to finish before starting play mode
  setTimeout(startBreak, 650);
}

// ---------- BREAK PHASE: hover to play ----------
function startBreak() {
  document.getElementById("bar-track").style.display = "none";
  document.body.classList.add("break-mode");
  status.textContent = "Break — move your mouse over the flowers";

  const flowers = document.querySelectorAll(".field-flower");

  flowers.forEach(function (flower) {
    flower.addEventListener("mouseenter", function () {
      synth.triggerAttack(flower.dataset.note);
      flower.classList.add("playing");
    });

    flower.addEventListener("mouseleave", function () {
      synth.triggerRelease(flower.dataset.note);
      flower.classList.remove("playing");
    });
  });
}

document.body.addEventListener(
  "click",
  function startOnce() {
    status.textContent = "Study phase: flowers growing...";
    studyPhase();
    document.body.removeEventListener("click", startOnce);
  },
  { once: true }
);