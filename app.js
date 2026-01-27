let standardTime = 25;
let flowTime = 90;
let totalSeconds = standardTime * 60;
let countdown;
let timerState = 'idle';
let graceTimeout;

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker registration failed'));
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

function setStandardTimer(minutes) {
  if (timerState !== 'idle') return;
  standardTime = minutes;
  totalSeconds = minutes * 60;
  updateDisplay();
  updateActiveButton('standard', minutes);
}

function setFlowTimer(minutes) {
  if (timerState !== 'idle') return;
  flowTime = minutes;
  updateActiveButton('flow', minutes);
}

function updateActiveButton(type, minutes) {
  const section = type === 'standard' ? 0 : 1;
  const buttons = document.querySelectorAll('.timer-section')[section].querySelectorAll('.preset-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === `${minutes}m`) {
      btn.classList.add('active');
    }
  });
}

function updateDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  document.getElementById('timeDisplay').textContent = 
    `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
  if (timerState === 'grace') {
    clearTimeout(graceTimeout);
    document.getElementById('softReminder').classList.remove('active');
    startFlowTimer();
    return;
  }

  if (timerState !== 'idle') return;

  timerState = 'standard';
  document.getElementById('timerLabel').textContent = 'Standard Timer';
  document.getElementById('startBtn').disabled = true;
  document.getElementById('resetBtn').disabled = false;
  disablePresetButtons(true);

  countdown = setInterval(() => {
    totalSeconds--;
    updateDisplay();

    if (totalSeconds <= 0) {
      clearInterval(countdown);
      onStandardComplete();
    }
  }, 1000);
}

function onStandardComplete() {
  timerState = 'grace';
  document.getElementById('softReminder').classList.add('active');
  document.getElementById('timerLabel').textContent = 'Time for a break?';
  document.getElementById('startBtn').textContent = 'Continue';
  document.getElementById('startBtn').disabled = false;

  graceTimeout = setTimeout(() => {
    document.getElementById('softReminder').classList.remove('active');
    startFlowTimer();
  }, 10000);
}

function startFlowTimer() {
  timerState = 'flow';
  const remainingMinutes = flowTime - standardTime;
  totalSeconds = remainingMinutes * 60;
  updateDisplay();
  document.getElementById('timerLabel').textContent = 'Flow State Timer';
  document.getElementById('startBtn').disabled = true;
  document.getElementById('startBtn').textContent = 'Start';

  countdown = setInterval(() => {
    totalSeconds--;
    updateDisplay();

    if (totalSeconds <= 0) {
      clearInterval(countdown);
      onFlowComplete();
    }
  }, 1000);
}

function onFlowComplete() {
  document.getElementById('strongReminder').classList.add('active');
  document.getElementById('alertSound').play().catch(e => console.log('Audio play failed:', e));
  timerState = 'complete';
}

function resetTimer() {
  clearInterval(countdown);
  clearTimeout(graceTimeout);
  timerState = 'idle';
  totalSeconds = standardTime * 60;
  updateDisplay();
  document.getElementById('softReminder').classList.remove('active');
  document.getElementById('strongReminder').classList.remove('active');
  document.getElementById('timerLabel').textContent = 'Ready to focus';
  document.getElementById('startBtn').disabled = false;
  document.getElementById('startBtn').textContent = 'Start';
  document.getElementById('resetBtn').disabled = true;
  disablePresetButtons(false);
}

function disablePresetButtons(disabled) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.disabled = disabled;
    btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
    btn.style.opacity = disabled ? '0.5' : '1';
  });
}

updateDisplay();