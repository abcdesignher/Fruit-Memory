const FRUITS = ["🍎", "🍌", "🍊", "🍇", "🍉", "🍓", "🥝", "🍍"];
const TOTAL_PAIRS = FRUITS.length;
const FLIP_BACK_DELAY = 850;

const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const timeEl = document.getElementById("time");
const newGameBtn = document.getElementById("newGameBtn");
const winOverlay = document.getElementById("winOverlay");
const playAgainBtn = document.getElementById("playAgainBtn");
const winMovesEl = document.getElementById("winMoves");
const winTimeEl = document.getElementById("winTime");
const confettiEl = document.getElementById("confetti");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let timerId = null;
let winTimeoutId = null;
let seconds = 0;
let gameStarted = false;

function createCards() {
  const deck = [];
  FRUITS.forEach((fruit) => {
    deck.push(fruit, fruit);
  });
  return deck;
}

function shuffleCards(deck) {
  const shuffled = deck.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderCards(deck) {
  board.innerHTML = "";
  deck.forEach((fruit, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.dataset.fruit = fruit;
    card.dataset.index = index;
    card.setAttribute("aria-label", "Hidden card");
    card.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back">🍀</span>
        <span class="card-face card-front"><span class="fruit">${fruit}</span></span>
      </span>`;
    card.addEventListener("click", handleCardClick);
    board.appendChild(card);
  });
}

function handleCardClick(event) {
  const card = event.currentTarget;

  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains("matched")) return;

  if (!gameStarted) startTimer();

  card.classList.add("flipped");
  card.setAttribute("aria-label", `Card ${Number(card.dataset.index) + 1}: ${card.dataset.fruit}`);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves += 1;
  updateStat(movesEl, moves);
  checkMatch();
}

function checkMatch() {
  const isMatch = firstCard.dataset.fruit === secondCard.dataset.fruit;

  if (isMatch) {
    [firstCard, secondCard].forEach((card) => {
      card.classList.add("matched", "pulse");
      setTimeout(() => card.classList.remove("pulse"), 550);
    });
    matchedPairs += 1;
    updateStat(pairsEl, `${matchedPairs} / ${TOTAL_PAIRS}`);

    resetTurn();
    if (matchedPairs === TOTAL_PAIRS) {
      stopTimer();
      winTimeoutId = setTimeout(showWinState, 550);
    }
  } else {
    const [a, b] = [firstCard, secondCard];
    a.classList.add("wrong");
    b.classList.add("wrong");
    setTimeout(() => {
      [a, b].forEach((card) => {
        card.classList.remove("flipped", "wrong");
        card.setAttribute("aria-label", "Hidden card");
      });
      if (firstCard === a || secondCard === b) resetTurn();
    }, FLIP_BACK_DELAY);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function startTimer() {
  gameStarted = true;
  if (timerId) return;
  timerId = setInterval(() => {
    seconds += 1;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function formatTime(total) {
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateStat(el, value) {
  el.textContent = value;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function showWinState() {
  winMovesEl.textContent = moves;
  winTimeEl.textContent = formatTime(seconds);
  winOverlay.hidden = false;
  launchConfetti();
  playAgainBtn.focus();
}

function launchConfetti() {
  confettiEl.innerHTML = "";
  const emojis = ["🍎", "🍌", "🍊", "🍇", "🍉", "🍓", "🥝", "🍍", "✨", "🌿"];
  for (let i = 0; i < 26; i++) {
    const span = document.createElement("span");
    span.textContent = emojis[i % emojis.length];
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDuration = `${2.4 + Math.random() * 2.4}s`;
    span.style.animationDelay = `${Math.random() * 1.6}s`;
    span.style.fontSize = `${1 + Math.random() * 1.1}rem`;
    confettiEl.appendChild(span);
  }
}

function resetGame() {
  stopTimer();
  clearTimeout(winTimeoutId);
  winTimeoutId = null;
  seconds = 0;
  moves = 0;
  matchedPairs = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  gameStarted = false;

  movesEl.textContent = "0";
  pairsEl.textContent = `0 / ${TOTAL_PAIRS}`;
  timeEl.textContent = "00:00";
  movesEl.classList.remove("bump");
  pairsEl.classList.remove("bump");

  winOverlay.hidden = true;
  confettiEl.innerHTML = "";

  renderCards(shuffleCards(createCards()));
}

function initializeGame() {
  resetGame();
  newGameBtn.addEventListener("click", resetGame);
  playAgainBtn.addEventListener("click", resetGame);
}

initializeGame();
