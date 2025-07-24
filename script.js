const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const distanceDisplay = document.getElementById('distance-display');
const instructions = document.getElementById('instructions');
const resetBtn = document.getElementById('reset-btn');
const setRefBtn = document.getElementById('set-ref-btn');
const refInput = document.getElementById('reference-input');
const unitSelect = document.getElementById('unit-select');

let markers = [];
let referenceLength = 1.0;
let referencePixels = 0;
let isSettingReference = true;

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then((stream) => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      resizeCanvas();
    };
  })
  .catch((err) => {
    alert("Camera access denied: " + err.message);
  });

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  markers.push({ x, y });

  if (markers.length === 2) {
    if (isSettingReference) {
      const unit = unitSelect.value;
      let val = parseFloat(refInput.value);
      if (unit === 'cm') val /= 100;
      if (unit === 'ft') val *= 0.3048;
      referenceLength = val;

      referencePixels = distanceBetween(markers[0], markers[1]);
      isSettingReference = false;
      instructions.textContent = "Tap to measure now";
    } else {
      const pixels = distanceBetween(markers[0], markers[1]);
      const meters = (pixels / referencePixels) * referenceLength;
      const display = unitSelect.value === 'ft'
        ? `${(meters * 3.28084).toFixed(2)} ft`
        : `${meters.toFixed(2)} m`;
      distanceDisplay.textContent = display;
    }
    drawLine();
  }
});

resetBtn.addEventListener("click", () => {
  markers = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  distanceDisplay.textContent = "0.00 m";
  instructions.textContent = isSettingReference
    ? "Tap to set reference points"
    : "Tap to measure now";
});

setRefBtn.addEventListener("click", () => {
  markers = [];
  isSettingReference = true;
  referencePixels = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  distanceDisplay.textContent = "0.00 m";
  instructions.textContent = "Tap to set reference points";
});

function drawLine() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (markers.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(markers[0].x, markers[0].y);
    ctx.lineTo(markers[1].x, markers[1].y);
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function distanceBetween(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
