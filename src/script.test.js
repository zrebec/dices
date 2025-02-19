import { test, expect } from 'vitest';
import { isAllEqual, isEvenOdd, isSequence, isPairs } from './modules/conditions.js';

test('isAllEqual true condition', () => {
	const diceValues = [3, 3, 3];
	expect(isAllEqual(diceValues)).toBe(true);
});

test('isAllEqual false condition', () => {
	const diceValues = [2, 3, 3];
	expect(isAllEqual(diceValues)).toBe(false);
});

test('isEvenOdd true condition', () => {
	const diceValues = [3, 1, 5];
	expect(isEvenOdd(diceValues)).toBe(true);
});

test('isEvenOdd false condition', () => {
	const diceValues = [3, 1, 6];
	expect(isEvenOdd(diceValues)).toBe(false);
});

test('isSequence true condition', () => {
	const diceValues = [3, 1, 2];
	expect(isSequence(diceValues)).toBe(true);
});

test('isSequence false condition', () => {
	const diceValues = [3, 1, 6];
	expect(isSequence(diceValues)).toBe(false);
});

test('isPairs true condition', () => {
	const diceValues = [3, 2, 2, 3];
	expect(isPairs(diceValues)).toBe(true);
});

test('isPairs false condition', () => {
	const diceValues = [3, 2, 2, 2];
	expect(isPairs(diceValues)).toBe(false);
});

test('validateGameMode pairs with odd number of dice', () => {
	const diceValues = [3, 2, 2];
	expect(isPairs(diceValues)).toBe(false);
});