import { generateLottoGames } from './src/utils/lottoGenerator.js';

console.log('--- Testing Lotto Generator Algorithm ---');

const mockFrequencies = {};
for (let i = 1; i <= 45; i++) {
  mockFrequencies[i] = (i % 5) + 1; // frequencies between 1 and 5
}
mockFrequencies[7] = 15; // Hot number
mockFrequencies[13] = 0; // Cold number

const fixedNumbers = [7, 13];
const excludedNumbers = [1, 2, 3, 4, 5];

const games = generateLottoGames({
  frequencies: mockFrequencies,
  fixedNumbers,
  excludedNumbers,
  baseWeight: 1,
  gameCount: 5,
});

console.log('Generated 5 Games:');
games.forEach((game) => {
  console.log(`Game ${game.label}:`, game.numbers);

  // Assert 1: Length is 6
  if (game.numbers.length !== 6) {
    throw new Error(`Game ${game.label} does not have 6 numbers!`);
  }

  // Assert 2: Sorted ascending
  for (let i = 0; i < game.numbers.length - 1; i++) {
    if (game.numbers[i] >= game.numbers[i + 1]) {
      throw new Error(`Game ${game.label} is not sorted ascending!`);
    }
  }

  // Assert 3: Fixed numbers contained
  fixedNumbers.forEach((f) => {
    if (!game.numbers.includes(f)) {
      throw new Error(`Game ${game.label} is missing fixed number ${f}!`);
    }
  });

  // Assert 4: Excluded numbers omitted
  excludedNumbers.forEach((ex) => {
    if (game.numbers.includes(ex)) {
      throw new Error(`Game ${game.label} contains excluded number ${ex}!`);
    }
  });
});

console.log('✅ All algorithm assertions passed successfully!');
