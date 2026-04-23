import { test, expect, describe } from 'vitest';
import { isAllEqual, isEvenOdd, isSequence, isPairs } from './modules/conditions.js';
import { diceColors, assignDiceColor } from './modules/colors.js';

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

test('isAllEqual single element returns false', () => {
	const diceValues = [4];
	expect(isAllEqual(diceValues)).toBe(false);
});

test('isPairs two equal dice returns true', () => {
	const diceValues = [5, 5];
	expect(isPairs(diceValues)).toBe(true);
});

test('isPairs empty array returns false', () => {
	const diceValues = [];
	expect(isPairs(diceValues)).toBe(false);
});

test('isSequence single element returns false', () => {
	expect(isSequence([3])).toBe(false);
});

test('isSequence empty array returns false', () => {
	expect(isSequence([])).toBe(false);
});

test('isEvenOdd single element returns false', () => {
	expect(isEvenOdd([4])).toBe(false);
});

test('isEvenOdd empty array returns false', () => {
	expect(isEvenOdd([])).toBe(false);
});

// ── Dice Colors ───────────────────────────────

describe('assignDiceColor', () => {
	test('assigns a color from the palette', () => {
		const map = new Map();
		const color = assignDiceColor(1, map);
		expect(diceColors).toContain(color);
	});

	test('returns the same color for the same dice on repeated calls', () => {
		const map = new Map();
		const first = assignDiceColor(1, map);
		const second = assignDiceColor(1, map);
		const third = assignDiceColor(1, map);
		expect(first).toBe(second);
		expect(second).toBe(third);
	});

	test('assigns different colors to different dice', () => {
		const map = new Map();
		const color1 = assignDiceColor(1, map);
		const color2 = assignDiceColor(2, map);
		const color3 = assignDiceColor(3, map);
		expect(color1).not.toBe(color2);
		expect(color1).not.toBe(color3);
		expect(color2).not.toBe(color3);
	});

	test('all 15 dice get unique colors (no duplicates within palette size)', () => {
		const map = new Map();
		const colors = [];
		for (let i = 1; i <= 15; i++) {
			colors.push(assignDiceColor(i, map));
		}
		const unique = new Set(colors);
		expect(unique.size).toBe(15);
	});

	test('each assigned color is a valid palette color', () => {
		const map = new Map();
		for (let i = 1; i <= 15; i++) {
			expect(diceColors).toContain(assignDiceColor(i, map));
		}
	});

	test('color persists after other dice are added', () => {
		const map = new Map();
		const color1 = assignDiceColor(1, map);
		assignDiceColor(2, map);
		assignDiceColor(3, map);
		expect(assignDiceColor(1, map)).toBe(color1);
	});

	test('removing a dice from the map frees its color for reuse', () => {
		const map = new Map();
		// Fill all 15 slots
		for (let i = 1; i <= 15; i++) assignDiceColor(i, map);
		const freedColor = map.get(5);
		map.delete(5);
		// The freed color should now be the only available one for a new dice
		// Assign to 14 other dice already, so only freedColor is available
		const newColor = assignDiceColor(16, map);
		expect(newColor).toBe(freedColor);
	});

	test('more than 15 dice falls back to palette colors (allows duplicates)', () => {
		const map = new Map();
		for (let i = 1; i <= 16; i++) {
			const color = assignDiceColor(i, map);
			expect(diceColors).toContain(color);
		}
		expect(map.size).toBe(16);
	});

	test('color identity is preserved across interleaved assignments', () => {
		const map = new Map();
		const c1 = assignDiceColor(1, map);
		const c3 = assignDiceColor(3, map);
		const c2 = assignDiceColor(2, map);
		// All different
		expect(new Set([c1, c2, c3]).size).toBe(3);
		// All stable
		expect(assignDiceColor(1, map)).toBe(c1);
		expect(assignDiceColor(2, map)).toBe(c2);
		expect(assignDiceColor(3, map)).toBe(c3);
	});

	test('independent maps do not share state', () => {
		const map1 = new Map();
		const map2 = new Map();
		assignDiceColor(1, map1);
		const color2 = assignDiceColor(1, map2);
		// map1 should not affect map2's available colors
		expect(diceColors).toContain(color2);
		expect(map1.size).toBe(1);
		expect(map2.size).toBe(1);
	});

	test('stores the color in the map', () => {
		const map = new Map();
		const color = assignDiceColor(7, map);
		expect(map.get(7)).toBe(color);
	});

	test('dice number 0 and negative numbers work correctly', () => {
		const map = new Map();
		const c0 = assignDiceColor(0, map);
		const cNeg = assignDiceColor(-1, map);
		expect(diceColors).toContain(c0);
		expect(diceColors).toContain(cNeg);
		expect(c0).not.toBe(cNeg);
		expect(assignDiceColor(0, map)).toBe(c0);
	});
});

describe('diceColors palette', () => {
	test('has exactly 15 colors', () => {
		expect(diceColors).toHaveLength(15);
	});

	test('all colors are unique', () => {
		expect(new Set(diceColors).size).toBe(15);
	});

	test('all colors are valid hex strings', () => {
		for (const color of diceColors) {
			expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
		}
	});
});