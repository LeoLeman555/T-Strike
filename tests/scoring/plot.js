// ----- Scoring Functions -----

function scoreLinear(diff, streak) {
  const base = Math.max(0, 100 - diff * 1000);
  const mult = 1 + 0.3 * streak;
  return Math.round(base * mult);
}

function scoreExpLog(diff, streak) {
  validateInputs(diff, streak);
  const base = 100 * Math.exp(-5 * diff);
  const mult = 1 + Math.log2(streak + 1) * 0.3;
  return Math.round(base * mult);
}

function scoreQuadExp(diff, streak) {
  validateInputs(diff, streak);
  const base =
    diff <= 0.01
      ? 250 + 250 * (1 - Math.pow(diff / 0.01, 2))
      : 100 * Math.exp(-5 * (diff - 0.01));
  const mult = 1 + Math.log2(streak + 1) * 0.1;
  return Math.round(base * mult);
}

function scoreSmoothExp(diff, streak) {
  validateInputs(diff, streak);
  const base =
    diff <= 0.015
      ? 250 + 250 * (1 - smoothstep(diff / 0.015))
      : 250 * Math.exp(-5 * (diff - 0.015));
  const mult = 1 + Math.log2(streak + 1) * 0.1;
  return Math.round(base * mult);
}

function scoreHardDrop(diff, streak) {
  validateInputs(diff, streak);
  const base =
    diff <= 0.015
      ? 150 + (500 - 150) * (1 - smoothstep(diff / 0.015))
      : 150 * Math.exp(-5 * (diff - 0.015));
  const mult = 1 + Math.log2(streak + 1) * 0.1;
  return Math.round(base * mult);
}

function validateInputs(diff, streak) {
  if (diff < 0 || streak < 0) {
    throw new Error("Invalid input values.");
  }
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function generateSurface(scoreFn, diffVals, streakVals) {
  return streakVals.map((s) => diffVals.map((d) => scoreFn(d, s)));
}

function createRange(max, steps) {
  const range = [];
  for (let i = 0; i <= steps; i++) {
    range.push((i * max) / steps);
  }
  return range;
}

// ----- Data Preparation -----

const diffSteps = 200;
const streakSteps = 20;
const diffMax = 0.5;
const streakMax = 20;

const diffVals = createRange(diffMax, diffSteps);
const streakVals = createRange(streakMax, streakSteps);

const scoringFunctions = {
  Linear: scoreLinear,
  ExpLog: scoreExpLog,
  QuadExp: scoreQuadExp,
  SmoothExp: scoreSmoothExp,
  HardDrop: scoreHardDrop,
};

const surfaces = Object.fromEntries(
  Object.entries(scoringFunctions).map(([label, fn]) => [
    label,
    generateSurface(fn, diffVals, streakVals),
  ])
);

// ----- Trace Construction -----

const allTraces = Object.entries(surfaces).map(([label, zVals], index) => ({
  z: zVals,
  x: diffVals,
  y: streakVals,
  type: "surface",
  name: label,
  showscale: false,
  opacity: index === 0 ? 1 : 0.8,
}));

const layout = {
  title: "Scoring Function Comparison",
  scene: {
    xaxis: { title: "Time Difference (s)" },
    yaxis: { title: "Streak" },
    zaxis: { title: "Score" },
  },
};

// Initial full plot
Plotly.newPlot("chart", allTraces, layout);

// ----- Checkbox Logic -----

document.getElementById("model-selector").addEventListener("change", () => {
  const checkboxes = document.querySelectorAll(
    "#model-selector input[type='checkbox']"
  );
  const selectedLabels = Array.from(checkboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  const filteredTraces = allTraces.filter((trace) =>
    selectedLabels.includes(trace.name)
  );
  Plotly.react("chart", filteredTraces, layout);
});
