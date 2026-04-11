import { isAllEqual, isPairs, isSequence, isEvenOdd } from './modules/conditions.js';

let numberOfDices = 3;
let diceArray = [];
let totalRollCount = 0;
let stopwatchInterval;
let stopwatchTime = 0;
let gameIsRunning = false;
let interval;
const version = 'v1.2.8';
let totalRollCountLimit = 0; // 0 for unlimited game
const maxDices = 10;
const originalTitle = document.title;
let timeout = 170;
let repeat = 14;

const speedPresets = [
	{ timeout: 420, repeat: 22 }, // 1 - Slowest
	{ timeout: 260, repeat: 18 }, // 2 - Slow
	{ timeout: 170, repeat: 14 }, // 3 - Normal
	{ timeout: 95, repeat: 10 }, // 4 - Fast
	{ timeout: 40, repeat: 6 }, // 5 - Fastest
];
const speedLabels = ['Slowest', 'Slow', 'Normal', 'Fast', 'Fastest'];
const validGameModes = ['allEqual', 'pairs', 'sequence', 'evenOdd', 'anything'];
let gameMode = 'allEqual';

// messages for translations
const totalRollCountLimitExceeded = 'Naplnený maximálny počet hodov a nebol dosiahnutý požadovaný výsledok';
const invalidGameMode = 'Neplatný herný mód';

const matrix = [
	{ number: 1, activePieces: [5] },
	{ number: 2, activePieces: [1, 9] },
	{ number: 3, activePieces: [1, 5, 9] },
	{ number: 4, activePieces: [1, 3, 7, 9] },
	{ number: 5, activePieces: [1, 3, 5, 7, 9] },
	{ number: 6, activePieces: [1, 3, 4, 6, 7, 9] },
];

// Selectors
const diceContainer = document.getElementById('diceContainer');
const rollButton = document.getElementById('btnRoll');
const plusButton = document.getElementById('btnPlus');
const statsSumValue = document.getElementById('statsSumValue');
const statsAvgValue = document.getElementById('statsAvgValue');
const totalRollCountValue = document.getElementById('totalRollCountValue');
const totalElapsedTime = document.getElementById('totalElapsedTime');
const alertElement = document.getElementById('alert');
const appVersion = document.getElementById('appVersion');
const gameModeButtons = document.querySelectorAll('.game-mode-btn');
const speedSlider = document.getElementById('speedSlider');
const speedLabel = document.getElementById('speedLabel');
const unlimitedToggle = document.getElementById('unlimitedToggle');
const maxRollsInput = document.getElementById('maxRollsInput');

// Event Listeners
speedSlider.addEventListener('input', () => {
	const idx = parseInt(speedSlider.value) - 1;
	timeout = speedPresets[idx].timeout;
	repeat = speedPresets[idx].repeat;
	speedLabel.textContent = speedLabels[idx];
});

/**
 * Sanitizes the max rolls input value to a safe integer within [1, 999].
 *
 * HTML min/max attributes are advisory only — they do not prevent a user
 * (or browser extension / DevTools) from submitting out-of-range, negative,
 * or non-numeric values. parseInt() on such input can return NaN or negative
 * numbers, which would cause the game to either never end (NaN is falsy in
 * comparisons) or end immediately (negative limit < totalRollCount on first
 * roll). Always clamp and validate on the JS side, never trust HTML
 * attributes alone as a security or correctness boundary.
 */
const sanitizeMaxRolls = (value) => {
	const parsed = parseInt(value);
	if (isNaN(parsed) || parsed < 1) return 1;
	if (parsed > 999) return 999;
	return parsed;
};

unlimitedToggle.addEventListener('change', () => {
	maxRollsInput.disabled = unlimitedToggle.checked;
	totalRollCountLimit = unlimitedToggle.checked ? 0 : sanitizeMaxRolls(maxRollsInput.value);
});

maxRollsInput.addEventListener('input', () => {
	if (!unlimitedToggle.checked) {
		const sanitized = sanitizeMaxRolls(maxRollsInput.value);
		totalRollCountLimit = sanitized;
		maxRollsInput.value = sanitized;
	}
});

/**
 * Game mode must not change while a game is in progress.
 *
 * Allowing a mode switch mid-game would let the player exploit a lucky
 * dice state — e.g. switching from "Sequence" to "All Equal" right after
 * a roll that happens to show identical values, winning instantly without
 * ever rolling under the new mode's rules. Locking the selector while
 * gameIsRunning prevents this and keeps the win condition consistent
 * for the entire duration of the game session.
 */
gameModeButtons.forEach((button) => {
	button.addEventListener('click', function () {
		if (gameIsRunning) return;

		// Remove active class from all buttons
		gameModeButtons.forEach((btn) => btn.classList.remove('active'));

		// Add active class to clicked button
		this.classList.add('active');

		// Change the game mode
		const mode = this.getAttribute('data-mode');
		if (validGameModes.includes(mode)) gameMode = mode;
	});
});

// Initialization
document.addEventListener('DOMContentLoaded', function () {
	// Set the initial active button
	document.querySelector(`.game-mode-btn[data-mode="${gameMode}"]`).classList.add('active');
});

const rollDice = (dice, diceObject = matrix[Math.floor(Math.random() * matrix.length)]) => {
	// If previous numbers on dice was equal, we must remove equal dice className
	document
		.querySelectorAll('.dice-container .dice')
		.forEach((dice) => dice.classList.remove('dice-equals'));

	// Check if the dice exists in the "diceArray" array, and add or update it
	const existingDice = diceArray.find((n) => n.diceNumber === dice);
	existingDice
		? (existingDice.diceValue = diceObject.number)
		: diceArray.push({ diceNumber: dice, diceValue: diceObject.number });

	// Loop through each number in the matrix
	for (let i = 1; i <= 9; i++) {
		// Get the current dice piece
		const dicePiece = document.querySelector(`.dice-${dice} .dice-piece-${i}`);

		// Show or hide the pot by setting the visibility
		dicePiece.style.visibility = diceObject.activePieces.includes(i) ? 'visible' : 'hidden';
	}
};

const drawDice = (diceNumber) => {
	// Create a new element to represent the dice and add the "dice" and "dice-number" classes to the element
	const dice = document.createElement('div');
	dice.classList.add('dice', `dice-${diceNumber}`);

	// Create nine elements to represent the dice pieces
	for (let i = 1; i <= 9; i++) {
		// Create a dice piece, set class and append the dice piece to the dice
		const dicePiece = document.createElement('div');
		dicePiece.classList.add('dice-piece', `dice-piece-${i}`);
		dice.appendChild(dicePiece);
	}

	// Append the dice to the dice container element
	diceContainer.appendChild(dice);

	// Set number 1 for all dices at first
	rollDice(diceNumber, matrix[0]);
	return true;
};

const startStopwatch = () => {
	clearInterval(stopwatchInterval);
	stopwatchInterval = setInterval(() => {
		stopwatchTime++;
		const hours = String(Math.floor(stopwatchTime / 3600)).padStart(2, '0');
		const minutes = String(Math.floor((stopwatchTime % 3600) / 60)).padStart(2, '0');
		const seconds = String(stopwatchTime % 60).padStart(2, '0');
		totalElapsedTime.textContent = `${hours}:${minutes}:${seconds}`;
	}, 1000);
};

const stopStopwatch = () => {
	clearInterval(stopwatchInterval);
};

const flashTitle = (title, flashing = true) => {
	clearInterval(interval);
	if (!flashing) {
		document.title = title;
		return;
	}
	interval = setInterval(() => {
		document.title = document.title === title ? originalTitle : title;
	}, 1000);
};

window.addEventListener('load', () => {
	// Initially draw dices
	for (let i = 1; i <= numberOfDices; i++) drawDice(i);

	// Set version
	appVersion.textContent = version;

	// Enable buttons
	toggleButtons(true);
});

const validateGameMode = () => {
	if (gameMode === 'pairs' && diceArray.length % 2 !== 0) {
		alertElement.textContent = invalidGameMode;
		alertElement.style.display = 'block';
		return false;
	}
	alertElement.style.display = 'none';
	return true;
};

const resetStopwatch = () => {
	stopwatchTime = 0;
	totalElapsedTime.textContent = '00:00:00';
};

// Function to enable or disable buttons and settings controls during a roll
const toggleButtons = (enabled) => {
	rollButton.disabled = !enabled;
	plusButton.disabled = !enabled;
	speedSlider.disabled = !enabled;
	unlimitedToggle.disabled = !enabled;
	maxRollsInput.disabled = !enabled || unlimitedToggle.checked;
};

const startGame = () => {
	if (!gameIsRunning && validateGameMode()) {
		startStopwatch();
		totalRollCount = 0;
		totalRollCountValue.textContent = '0';
		flashTitle('Hod kockou!', false);
		clearInterval(interval);
		resetStopwatch();
		gameIsRunning = true;
		document.title = originalTitle;
	}
};

const repeatRoll = () => {
	if (totalRollCount < totalRollCountLimit || totalRollCountLimit === 0) {
		rollDices();
	} else {
		alertElement.textContent = totalRollCountLimitExceeded;
		alertElement.style.display = 'block';
		stopStopwatch();
		flashTitle('Neúspech!');
		gameIsRunning = false;
	}
};

const performRolls = async () => {
	const diceTimeout = timeout / numberOfDices;
	const totalRolls = repeat * numberOfDices;

	for (let i = 0; i < totalRolls; i++) {
		await new Promise((resolve) => setTimeout(resolve, diceTimeout));
		const randomDiceNumber = Math.floor(Math.random() * numberOfDices) + 1;
		rollDice(randomDiceNumber);
	}
};

const wonTheGame = () => {
	document.querySelectorAll('.dice-container .dice').forEach((dice) => dice.classList.add('dice-equals'));
	alertElement.style.display = 'none';
	stopStopwatch();
	flashTitle('Vyhral si!');
	gameIsRunning = false;
};

const gameCheckResult = () => {
	const diceValues = diceArray.map((dice) => dice.diceValue);
	const hasPairsLength = diceArray.length % 2 === 0;

	if (
		(gameMode === 'allEqual' && isAllEqual(diceValues)) ||
		(gameMode === 'sequence' && isSequence(diceValues)) ||
		(gameMode === 'evenOdd' && isEvenOdd(diceValues)) ||
		(gameMode === 'pairs' && hasPairsLength && isPairs(diceValues)) ||
		(gameMode === 'anything' &&
			(isAllEqual(diceValues) ||
				isSequence(diceValues) ||
				isEvenOdd(diceValues) ||
				(hasPairsLength && isPairs(diceValues))))
	)
		wonTheGame();
	else repeatRoll();
};

const updateStatistics = () => {
	const sum = diceArray.reduce((acc, dice) => acc + dice.diceValue, 0);
	statsSumValue.textContent = sum;
	statsAvgValue.textContent = (sum / diceArray.length).toFixed(2);
	totalRollCountValue.textContent = ++totalRollCount;
};

const rollDices = async () => {
	if (!validateGameMode()) return;

	// Disable the roll button
	toggleButtons(false);

	await performRolls();

	// Enable the roll button and plus button
	toggleButtons(true);

	updateStatistics();
	gameCheckResult();
};

const addNewDice = () => {
	if (numberOfDices >= maxDices) return;
	clearInterval(stopwatchInterval);
	gameIsRunning = false;
	flashTitle(originalTitle, false);
	diceArray = [];
	diceContainer.textContent = '';
	numberOfDices++;
	for (let i = 1; i <= numberOfDices; i++) drawDice(i);
	statsSumValue.textContent = 0;
	statsAvgValue.textContent = 0;
	totalRollCountValue.textContent = 0;
	resetStopwatch();
	toggleButtons(true);
};

// Handle the "click" event on the roll button
rollButton.addEventListener('click', () => {
	if (validateGameMode()) {
		alertElement.style.display = 'none';
		startGame();
		rollDices();
	} else {
		toggleButtons(true); // Enable buttons if the game mode is invalid
	}
});

// Add new dice after click on plus button
plusButton.addEventListener('click', () => {
	addNewDice();
	if (!validateGameMode()) return;
	clearInterval(interval);
	document.title = originalTitle;
});

/**
 * Global keyboard shortcuts handler.
 *
 * Security / UX concern:
 * Global keydown listeners intercept ALL keystrokes regardless of where the
 * user's focus currently is. Without the form-element guard below, pressing
 * 'R' or 'Space' while typing into an <input>, <textarea>, or <select> would
 * trigger game actions (rolling dice, adding a dice) instead of entering text.
 *
 * This is a well-known pitfall in web applications that mix global hotkeys
 * with form controls. The standard mitigation is to check event.target.tagName
 * and bail out early when the keystroke originates from a form element, so the
 * browser can process it normally (typing characters, toggling checkboxes, etc.).
 *
 * Without this guard an attacker or confused user could also inadvertently
 * trigger rapid repeated game actions by holding a key down in an input field,
 * causing unexpected state mutations (resetting stopwatch, adding dozens of
 * dice via the Space key, etc.).
 */
addEventListener('keydown', (event) => {
	const tag = event.target.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

	if (event.key.toUpperCase() === 'R') {
		rollButton.click();
	} else if (event.key === ' ') {
		plusButton.click();
	}
});
