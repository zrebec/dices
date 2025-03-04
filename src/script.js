import { isAllEqual, isPairs, isSequence, isEvenOdd } from './modules/conditions.js';

let numberOfDices = 3;
let diceArray = [];
let totalRollCount = 1;
let stopwatchInterval;
let stopwatchTime = 0;
let gameIsRunning = false;
let interval;
const totalRollCountLimit = 0; // 0 for unlimited game
const originalTitle = document.title;
const timeout = 170;
const repeat = 14;
let gameMode = 'allEqual'; // Possible values: 'allEqual', 'sequence', 'evenOdd', 'pairs', 'anything'

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
const gameModeButtons = document.querySelectorAll('.game-mode-btn');

// Event Listeners
gameModeButtons.forEach(button => {
	button.addEventListener('click', function () {
		// Remove active class from all buttons
		gameModeButtons.forEach(btn => btn.classList.remove('active'));

		// Add active class to clicked button
		this.classList.add('active');

		// Change the game mode
		gameMode = this.getAttribute('data-mode');
	});
});

// Initialization
document.addEventListener('DOMContentLoaded', function () {
	// Set the initial active button
	document.querySelector(`.game-mode-btn[data-mode="${gameMode}"]`).classList.add('active');
});

const rollDice = (dice, diceObject = matrix[Math.floor(Math.random() * matrix.length)]) => {
	// If previous numbers on dice was equal, we must remove equal dice className
	document.querySelectorAll('.dice-container .dice').forEach(dice => dice.classList.remove('dice-equals'));

	// Check if the dice exists in the "diceArray" array, and add or update it
	const existingDice = diceArray.find(n => n.diceNumber === dice);
	existingDice ? existingDice.diceValue = diceObject.number : diceArray.push({ diceNumber: dice, diceValue: diceObject.number });

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
}

const stopStopwatch = () => {
	clearInterval(stopwatchInterval);
}

const flashTitle = (title, flashing = true) => {
	if (!flashing) { document.title = title; clearInterval(interval); return; }
	interval = setInterval(() => { document.title = document.title === title ? originalTitle : title; }, 1000);
};

window.addEventListener('load', () => {
	// Initially draw dices
	for (let i = 1; i <= numberOfDices; i++) drawDice(i);

	// Enable buttons
	toggleButtons(true);
});

const validateGameMode = () => {
	if (gameMode === 'pairs' && diceArray.length % 2 !== 0) {
		document.getElementById('alert').textContent = invalidGameMode;
		document.getElementById('alert').style.display = 'block';
		return false;
	}
	document.getElementById('alert').style.display = 'none';
	return true;
}

const resetStopwatch = () => {
	stopwatchTime = 0;
	totalElapsedTime.textContent = '00:00:00';
}

// Function to enable or disable buttons
const toggleButtons = (enabled) => {
	rollButton.disabled = !enabled;
	plusButton.disabled = !enabled;
}

const startGame = () => {
	if (!gameIsRunning && validateGameMode()) {
		startStopwatch();
		totalRollCount = 1;
		totalRollCountValue.textContent = '0';
		flashTitle('Hod kockou!', false);
		clearInterval(interval);
		resetStopwatch();
		gameIsRunning = true;
		document.title = originalTitle;
	}
}

const repeatRoll = () => {
	if (totalRollCount < totalRollCountLimit || totalRollCountLimit === 0) {
		rollDices();
	} else {
		document.getElementById('alert').textContent = totalRollCountLimitExceeded;
		document.getElementById('alert').style.display = 'block';
		stopStopwatch();
		flashTitle('Neúspech!');
		gameIsRunning = false;
	}
};

const performRolls = async () => {
	const diceTimeout = timeout / numberOfDices;
	const totalRolls = repeat * numberOfDices;

	for (let i = 0; i < totalRolls; i++) {
		await new Promise(resolve => setTimeout(resolve, diceTimeout));
		const randomDiceNumber = Math.floor(Math.random() * numberOfDices) + 1;
		rollDice(randomDiceNumber);
	}
}

const wonTheGame = () => {
	document.querySelectorAll('.dice-container .dice').forEach(dice => dice.classList.add('dice-equals'));
	document.getElementById('alert').style.display = 'none';
	stopStopwatch();
	flashTitle('Vyhral si!');
	gameIsRunning = false;
}

const gameCheckResult = () => {
	const diceValues = diceArray.map(dice => dice.diceValue);
	const hasPairsLength = diceArray.length % 2 === 0;

	if (
		(gameMode === 'allEqual' && isAllEqual(diceValues)) ||
		(gameMode === 'sequence' && isSequence(diceValues)) ||
		(gameMode === 'evenOdd' && isEvenOdd(diceValues)) ||
		(gameMode === 'pairs' && hasPairsLength && isPairs(diceValues)) ||
		(gameMode === 'anything' && (isAllEqual(diceValues) || isSequence(diceValues) || isEvenOdd(diceValues) || (hasPairsLength && isPairs(diceValues))))
	) wonTheGame();
	else repeatRoll();
}

const updateStatistics = () => {
	const sum = diceArray.reduce((acc, dice) => acc + dice.diceValue, 0);
	statsSumValue.textContent = sum;
	statsAvgValue.textContent = (sum / diceArray.length).toFixed(2);
	totalRollCountValue.textContent = ++totalRollCount;
}

const rollDices = async () => {
	if (!validateGameMode()) return;

	// Disable the roll button
	toggleButtons(false);

	await performRolls();

	// Enable the roll button and plus button
	toggleButtons(true);

	gameCheckResult();
	updateStatistics();
}

const addNewDice = () => {
	clearInterval(stopwatchInterval);
	diceArray = [];
	diceContainer.innerHTML = '';
	numberOfDices++;
	for (let i = 1; i <= numberOfDices; i++) drawDice(i);
	statsSumValue.textContent = 0;
	statsAvgValue.textContent = 0;
	totalRollCountValue.textContent = 0;
	resetStopwatch();
	toggleButtons(true);
}

// Handle the "click" event on the roll button
rollButton.addEventListener('click', () => {
	if (validateGameMode()) {
		document.getElementById('alert').style.display = 'none';
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

addEventListener('keydown', (event) => {
	if (event.key.toUpperCase() === 'R') {
		rollButton.click();
	} else if (event.key === ' ') {
		plusButton.click();
	}
});