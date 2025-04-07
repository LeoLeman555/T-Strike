let isRunning = false;
let timer = 0;
let interval;
const targetTime = 5.0; // can be change later

const display = document.getElementById("display");
const button = document.getElementById("start-stop-btn");
const resultMsg = document.getElementById("result-msg");
const target = document.getElementById("target");

target.textContent = targetTime.toFixed(2);

function updateTimer() {
  timer += 0.01;
  display.textContent = timer.toFixed(2) + "s";
}

function startTimer() {
  timer = 0;
  resultMsg.textContent = "";
  interval = setInterval(updateTimer, 10); // 100 FPS
}

function stopTimer() {
  clearInterval(interval);
  const diff = Math.abs(timer - targetTime);

  if (diff <= 0.05) {
    resultMsg.textContent = "🎯 Perfect!";
    resultMsg.style.color = "#00e676";
  } else if (diff <= 0.2) {
    resultMsg.textContent = "👍 Good!";
    resultMsg.style.color = "#ffeb3b";
  } else {
    resultMsg.textContent = "❌ Missed!";
    resultMsg.style.color = "#ff5252";
  }
}

button.addEventListener("click", () => {
  if (!isRunning) {
    startTimer();
    button.textContent = "Stop";
  } else {
    stopTimer();
    button.textContent = "Start";
  }
  isRunning = !isRunning;
});
