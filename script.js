let numberOfDices = 3;
let diceArray = [];
let totalRollCount = 0;
let totalRollCountLimit = 0; // 0 for unlimited game
const timeout = 170;
const repeat = 14;
let gameMode = 'allEqual'; // Possible values: 'allEqual', 'sequence', 'evenOdd', 'all', 'pairs'

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
const diceContainer = $('#diceContainer');
const rollButton = $('#btnRoll');
const plusButton = $('#btnPlus');
const statsSumValue = $('#statsSumValue');
const statsAvgValue = $('#statsAvgValue');
const totalRollCountValue = $('#totalRollCountValue');
const gameModeButtons = $('.game-mode-btn');

// Event Listeners
gameModeButtons.click(function () {
	// Remove active class from all buttons
	gameModeButtons.removeClass('active');

	// Add active class to clicked button
	$(this).addClass('active');

	// Change the game mode
	gameMode = $(this).attr('data-mode');
});

// Initialization
$(document).ready(function () {
	// Set the initial active button
	$(`.game-mode-btn[data-mode="${gameMode}"]`).addClass('active');
});

const rollDice = (dice, diceObject) => {
	// If "number" input parameter was not given, it will be random number
	if (diceObject === undefined || diceObject === null)
		diceObject = $(matrix).get(Math.floor(Math.random() * matrix.length));

	// If previous numbers on dice was equal, we must remove equal dice className
	$('.dice-container').find('.dice').removeClass('dice-equals');

	// If previous numbers on dice was equal, we must remove equal dice className
	$('.dice-container').find('.dice').removeClass('dice-equals');

	// Check if the dice exists in the "diceArray" array, and add or update it
	diceArray.find((n) => n.diceNumber === dice)
		? (diceArray.find((n) => n.diceNumber === dice).diceValue = diceObject.number)
		: diceArray.push({ diceNumber: dice, diceValue: diceObject.number });

	// Loop through each number in the matrix
	for (let i = 1; i <= 9; i++) {
		// Get the current dice piece
		const dicePiece = $(`.dice-${dice}`).find(`.dice-piece-${i}`);

		// If the number of specific pieces equals the number in the current cycle,
		// it's a match and we can show the pot by setting the visibility to visible.
		// Otherwise, we hide the pot by setting the visibility to hidden.
		dicePiece.css('visibility', diceObject.activePieces.includes(i) ? 'visible' : 'hidden');
	}
};

const drawDice = (diceNumber) => {
	// Create a new element to represent the dice and add the "dice" and "dice-number" classes to the element
	const dice = $('<div>').addClass(`dice dice-${diceNumber}`);

	// Create nine elements to represent the dice pieces
	for (let i = 1; i <= 9; i++) {
		// Create a dice piece, set class and append the dice piece to the dice
		dice.append($('<div>').addClass(`dice-piece dice-piece-${i}`));
	}

	// Append the dice to the dice container element
	diceContainer.append(dice);

	// Set number 1 for all dices at first
	rollDice(diceNumber, matrix[0]);
	return true;
};

const isEvenOdd = (arr) => {
	const even = arr.every((value) => value % 2 === 0);
	const odd = arr.every((value) => value % 2 !== 0);
	return even || odd;
};

const isSequence = (arr) => {
	const sortedArr = [...arr].sort((a, b) => a - b);
	for (let i = 1; i < sortedArr.length; i++) {
		if (sortedArr[i] - sortedArr[i - 1] !== 1) return false;
	}
	return true;
};

const isPairs = (arr) => {
	const sortedArr = [...arr].sort((a, b) => a - b);
	for (let i = 0; i < sortedArr.length; i += 2) {
		if (sortedArr[i] !== sortedArr[i + 1]) return false;
	}
	return true;
};

const isAllEqual = (arr) => {
	return arr.length > 1 && arr.every((value) => value === arr[0]);
};

window.addEventListener('load', () => {
	// Color schema
	//document.documentElement.style.setProperty('--table-background', '#000000');

	// Initaly draw a dices
	for (let i = 1; i <= numberOfDices; i++) drawDice(i);

	// Enable buttons
	// Disable the roll button
	$(rollButton).add(plusButton).prop({ disabled: false });
});

// Handle the "click" event on the roll button
rollButton.click(() => {
	$('#alert').hide();
	(async () => {
		if (gameMode === 'pairs' && diceArray.length % 2 !== 0) {
			$('#alert').text(invalidGameMode).show();
			return;
		}

		// Disable the roll button
		$(rollButton).add(plusButton).prop({ disabled: true });

		let i = 0;
		// Calculate the timeout for each dice roll
		const diceTimeout = timeout / numberOfDices;

		// Repeat the dice rolling until the desired number of repeats is reached
		for (i = 0; i < repeat * numberOfDices; i++) {
			// Wait for the specified timeout
			await new Promise((resolve) => setTimeout(resolve, diceTimeout));

			// Choose a random dice to roll
			rollDice(Math.floor(Math.random() * numberOfDices) + 1);
		}

		// Enable the roll button and plus button
		$(rollButton).add(plusButton).prop({ disabled: false });

		// Check about all symbols are equal
		const diceValues = diceArray.map((dice) => dice.diceValue);
		const allEqual = isAllEqual(diceValues);
		const seq = isSequence(diceValues);
		const evenOdd = isEvenOdd(diceValues);
		const pairs = isPairs(diceValues);

		if (
			(gameMode === 'allEqual' && allEqual) ||
			(gameMode === 'sequence' && seq) ||
			(gameMode === 'evenOdd' && evenOdd) ||
			(gameMode === 'pairs' && pairs && diceValues.length % 2 === 0) ||
			(gameMode === 'all' && (allEqual || seq || evenOdd || (pairs && diceValues.length % 2 === 0)))
		) {
			$('.dice-container').find('.dice').addClass('dice-equals');
			$('#alert').hide();
		} else if (totalRollCount < totalRollCountLimit || totalRollCountLimit === 0) {
			rollButton.click();
		} else {
			$('#alert').text(totalRollCountLimitExceeded).show();
		}

		// Calc statistics
		statsSumValue.text(diceArray.reduce((acc, dice) => acc + dice.diceValue, 0));
		statsAvgValue.text(
			(diceArray.reduce((acc, dice) => acc + dice.diceValue, 0) / diceArray.length).toFixed(2)
		);
		totalRollCountValue.text(++totalRollCount);
	})();
});

// Add new dice after click on plus button
plusButton.click(() => drawDice(++numberOfDices));
