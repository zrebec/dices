# Dice Roller Game

This is a simple dice rolling game where players can roll dice and try to achieve various winning conditions. The game supports multiple dice, different game modes, and provides statistics such as the sum and average of the dice values. It also includes a stopwatch to track the time taken for each game.

## Game Modes

The game supports the following modes:

1. **All Equal**: All dice must show the same number.
2. **Pairs**: On an even count of dice, there must be pairs of numbers.
3. **Even/Odd**: All dice must show either even or odd numbers.
4. **Sequence**: The numbers on the dice must form a sequence (e.g., 1, 2, 3 on three dice).
5. **Anything**: Any of the above conditions can be met to win.

## Features

- **Add Dice**: Players can add more dice to the game by pressing the spacebar or clicking the "+1" button.
- **Roll Dice**: Players can roll the dice by pressing the "R" key or clicking the "Roll" button.
- **Stopwatch**: A stopwatch tracks the time taken for each game.
- **Flashing Title Bar**: The title bar flashes to indicate the result of the game (win or lose).
- **Statistics**: The game displays the sum and average of the dice values, as well as the total roll count.

## How to Play

1. **Select Game Mode**: Choose a game mode by clicking one of the buttons (All Equal, Pairs, Sequence, Even/Odd, Anything).
2. **Add Dice**: Press the spacebar or click the "+1" button to add more dice.
3. **Roll Dice**: Press the "R" key or click the "Roll" button to roll the dice.
4. **Check Result**: The game will automatically check if the winning condition is met. If not, it will continue rolling until the maximum roll count is reached or the condition is met.
5. **View Statistics**: The sum, average, and total roll count are displayed on the screen.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/dice-roller-game.git
   cd dice-roller-game
   ```

2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open your browser and navigate to (http://localhost:5173)

## Scripts
- `npm run dev` Start the development server
- `npm build` Build the project for production
- `npm run serve` Preview the production build

## File Structure
- src
    - `index.html`: The main HTML file
    - `styles.css`: The main CSS file
    - `script.js`: The main JavaScript containing the draw dices and game logic
    - `conditions.js`: JavaScript file containing the winning conditioning functions
    - `script.tests.js`: TBD