'use strict';

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#1a1a1a');
  tg.setBackgroundColor('#1a1a1a');
  // В новых версиях Telegram MainButton может называться BottomButton.
  const mainButton = tg.MainButton ?? tg.BottomButton;
  if (mainButton) {
    mainButton.setText('Закрыть');
    mainButton.onClick(() => tg.close());
    mainButton.show();
  }
}

// Задания намеренно загружаются с сервера ПОСЛЕ проверки оплаты.
// В исходном сообщении HTML отсутствовал, поэтому исходный tasks невозможно скопировать.
const tasks = {easy: null, medium: null, hard: null};
const PRICES = {medium: 50, hard: 100}; // При изменении .env обновить и здесь.
const LEVEL_NAMES = {easy: 'Лёгкий', medium: 'Средний', hard: 'Смелый'};
const unlockedLevels = {easy: false, medium: false, hard: false};

let selectedLevel = 'easy';
let selectedGender = null;
let currentTask = null;
let timerInterval = null;
let secondsLeft = 60;
let currentRequest = 0;
let lockedPromptLevel = null;

const $ = (id) => document.getElementById(id);
const game = $('game');
const taskDisplay = $('taskDisplay');
const confirmButton = $('confirmButton');
const nextButton = $('nextButton');
const timerSection = $('timerSection');

async function apiPost(url, data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({initData: tg?.initData ?? '', ...data}),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function fail(text) {
  $('status').classList.add('hidden');
  game.classList.add('hidden');
  $('fatalText').textContent = text;
  $('fatal').classList.remove('hidden');
}

function drawLevelAccess() {
  Object.keys(unlockedLevels).forEach((level) => {
    const node = document.querySelector(`[data-access="${level}"]`);
    if (level === 'easy') node.textContent = '✅ Бесплатно';
    else node.textContent = unlockedLevels[level] ? '✅ Куплен' : `🔒 ${PRICES[level]} ⭐`;
  });
}

function selectLevelMarkup(level) {
  document.querySelectorAll('[data-level]').forEach((button) => {
    button.classList.toggle('selected', button.dataset.level === level);
  });
}

function resetTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  secondsLeft = 60;
  $('timer').textContent = '01:00';
  $('timerCaption').textContent = 'У вас одна минута';
  timerSection.classList.add('hidden');
  nextButton.classList.add('hidden');
}

function hideTaskActions() {
  resetTimer();
  confirmButton.classList.add('hidden');
  currentTask = null;
}

function showLockedLevel(level) {
  lockedPromptLevel = level;
  hideTaskActions();
  $('taskKicker').textContent = 'ЗАКРЫТЫЙ УРОВЕНЬ';
  taskDisplay.replaceChildren();
  const heading = document.createElement('p');
  heading.textContent = '🔒 Уровень заблокирован';
  const button = document.createElement('button');
  button.className = 'purchase-cta';
  button.textContent = `Купить за ${PRICES[level]} ⭐`;
  button.addEventListener('click', () => buyLevel(level));
  taskDisplay.append(heading, button);
  tg?.HapticFeedback?.notificationOccurred('warning');
}

async function loadTasks(level) {
  if (tasks[level]) return;
  const result = await apiPost('/api/tasks', {level});
  for (const gender of ['male', 'female']) {
    if (!Array.isArray(result.tasks?.[gender]) || result.tasks[gender].length !== 10) {
      throw new Error('Неверный набор заданий');
    }
  }
  tasks[level] = result.tasks;
}

async function setLevel(level) {
  if (!Object.hasOwn(unlockedLevels, level)) return;
  const requestId = ++currentRequest;
  if (!unlockedLevels[level]) {
    showLockedLevel(level);
    return;
  }
  selectedLevel = level;
  lockedPromptLevel = null;
  selectLevelMarkup(level);
  hideTaskActions();
  $('taskKicker').textContent = `УРОВЕНЬ «${LEVEL_NAMES[level].toUpperCase()}»`;
  taskDisplay.textContent = 'Загружаем задания…';
  try {
    await loadTasks(level);
    if (requestId !== currentRequest) return;
    taskDisplay.textContent = selectedGender
      ? 'Нажмите «Для него» или «Для неё» — получите новый фант.'
      : 'Выберите, для кого задание, — и начнём!';
  } catch (error) {
    if (requestId !== currentRequest) return;
    taskDisplay.textContent = 'Не удалось загрузить задания. Попробуйте выбрать уровень ещё раз.';
    if (error.status === 401 || error.status === 403) {
      fail('Сессия истекла или доступ закрыт. Откройте игру через бота.');
    }
  }
}

function showTask(gender) {
  if (!['male', 'female'].includes(gender) || lockedPromptLevel || !unlockedLevels[selectedLevel]) return;
  const pool = tasks[selectedLevel]?.[gender];
  if (!pool) return;
  resetTimer();
  selectedGender = gender;
  document.querySelectorAll('[data-gender]').forEach((button) => {
    button.classList.toggle('active', button.dataset.gender === gender);
  });
  const candidates = pool.filter((task) => task !== currentTask);
  currentTask = candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];
  $('taskKicker').textContent = gender === 'male' ? 'ФАНТ ДЛЯ НЕГО' : 'ФАНТ ДЛЯ НЕЁ';
  taskDisplay.textContent = currentTask;
  confirmButton.classList.remove('hidden');
  tg?.HapticFeedback?.impactOccurred('light');
}

function renderTimer() {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  $('timer').textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (!currentTask || timerInterval !== null) return;
  secondsLeft = 60;
  renderTimer();
  timerSection.classList.remove('hidden');
  confirmButton.classList.add('hidden');
  nextButton.classList.remove('hidden');
  const finishAt = Date.now() + 60000;
  timerInterval = window.setInterval(() => {
    secondsLeft = Math.max(0, Math.ceil((finishAt - Date.now()) / 1000));
    renderTimer();
    if (secondsLeft === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      $('timerCaption').textContent = 'Время вышло! Нажмите «Стоп / Далее».';
      tg?.HapticFeedback?.notificationOccurred('success');
    }
  }, 200);
}

function stopAndNext() {
  resetTimer();
  if (selectedGender) showTask(selectedGender);
}

async function buyLevel(level) {
  if (!['medium', 'hard'].includes(level)) return;
  const button = taskDisplay.querySelector('.purchase-cta');
  if (button) button.disabled = true;
  try {
    // Работает при запуске из Menu Button, профиля и reply-клавиатуры.
    await apiPost('/api/buy', {level});
    tg?.close();
    // В браузере без Telegram кнопки заблокированы на старте.
  } catch (error) {
    if (button) button.disabled = false;
    if (error.status === 409) {
      try {
        const data = await apiPost('/api/me');
        Object.assign(unlockedLevels, data.levels);
        Object.assign(PRICES, data.prices ?? {});
        drawLevelAccess();
        if (unlockedLevels[level]) {
          await setLevel(level);
          return;
        }
      } catch (_) { /* Ниже покажем инструкцию. */ }
    }
    // sendData существует только при открытии из ReplyKeyboard WebApp.
    // Если HTTP-соединение пропало и нет query_id, пытаемся использовать его.
    if (!error.status && tg?.sendData && !tg.initDataUnsafe?.query_id) {
      try {
        tg.sendData(JSON.stringify({action: 'buy', level}));
        return;
      } catch (_) { /* Зависит от режима запуска клиента Telegram. */ }
    }
    taskDisplay.textContent = `Не удалось выставить счёт. Откройте чат с ботом и отправьте /buy_${level}.`;
  }
}

async function init() {
  $('closeButton').addEventListener('click', () => tg?.close());
  document.querySelectorAll('[data-level]').forEach((button) => {
    button.addEventListener('click', () => setLevel(button.dataset.level));
  });
  document.querySelectorAll('[data-gender]').forEach((button) => {
    button.addEventListener('click', () => showTask(button.dataset.gender));
  });
  confirmButton.addEventListener('click', startTimer);
  nextButton.addEventListener('click', stopAndNext);
  if (!tg?.initData) {
    fail('Откройте игру из личного чата Telegram-бота. В обычном браузере она недоступна.');
    return;
  }
  try {
    const result = await apiPost('/api/me');
    Object.assign(unlockedLevels, result.levels);
    Object.assign(PRICES, result.prices ?? {});
    drawLevelAccess();
    $('status').classList.add('hidden');
    game.classList.remove('hidden');
    await setLevel('easy');
  } catch (error) {
    if (error.status === 401) fail('Сессия Telegram недействительна или устарела. Откройте игру через бота.');
    else if (error.status === 403) fail('Сначала подтвердите возраст 18+ командой /start в личном чате бота.');
    else fail('Не удалось связаться с сервером. Проверьте соединение и откройте игру заново.');
  }
}

init();
