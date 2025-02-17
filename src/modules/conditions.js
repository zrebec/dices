export const isAllEqual = (arr) => {
	return arr.length > 1 && arr.every(value => value === arr[0]);
};

export const isPairs = (arr) => {
	const sortedArr = [...arr].sort((a, b) => a - b);
	for (let i = 0; i < sortedArr.length; i += 2) {
		if (sortedArr[i] !== sortedArr[i + 1]) return false;
	}
	return true;
};

export const isSequence = (arr) => {
	const sortedArr = [...arr].sort((a, b) => a - b);
	for (let i = 1; i < sortedArr.length; i++) {
		if (sortedArr[i] - sortedArr[i - 1] !== 1) return false;
	}
	return true;
};

export const isEvenOdd = (arr) => {
	const even = arr.every(value => value % 2 === 0);
	const odd = arr.every(value => value % 2 !== 0);
	return even || odd;
};