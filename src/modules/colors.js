export const diceColors = [
	'#e74c3c', // Red
	'#3498db', // Blue
	'#2ecc71', // Green
	'#f39c12', // Orange
	'#9b59b6', // Purple
	'#1abc9c', // Teal
	'#e91e63', // Pink
	'#00bcd4', // Cyan
	'#ff9800', // Amber
	'#8bc34a', // Light Green
	'#ff5722', // Deep Orange
	'#607d8b', // Blue Grey
	'#cddc39', // Lime
	'#03a9f4', // Light Blue
	'#ffc107', // Yellow
];

/**
 * Assigns a unique color to a dice. If the dice already has a color
 * in the provided map, returns the existing one. Otherwise picks
 * a random color that is not yet used by any other dice.
 *
 * When all 15 colors are exhausted (more than 15 dice), falls back
 * to a random color from the full palette (allowing duplicates).
 */
export const assignDiceColor = (diceNumber, colorMap) => {
	if (colorMap.has(diceNumber)) return colorMap.get(diceNumber);
	const usedColors = new Set(colorMap.values());
	const available = diceColors.filter((c) => !usedColors.has(c));
	const color = available.length > 0
		? available[Math.floor(Math.random() * available.length)]
		: diceColors[Math.floor(Math.random() * diceColors.length)];
	colorMap.set(diceNumber, color);
	return color;
};
