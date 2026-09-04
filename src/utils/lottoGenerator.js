/**
 * Weighted Random Sampling Algorithm for Lotto 6/45
 * 
 * @param {Object} options
 * @param {Object} options.frequencies - Map of { [number]: frequencyCount } from recent draws
 * @param {number[]} options.fixedNumbers - Array of numbers to include in every game (max 5)
 * @param {number[]} options.excludedNumbers - Array of numbers to exclude from drawing (max 10)
 * @param {number} [options.baseWeight=1] - Base weight added to each number's frequency count
 * @param {number} [options.gameCount=5] - Number of games to generate (default 5 for A, B, C, D, E)
 * @returns {Array<{ label: string, numbers: number[] }>} Array of games
 */
export function generateLottoGames({
  frequencies = {},
  fixedNumbers = [],
  excludedNumbers = [],
  baseWeight = 1,
  gameCount = 5,
}) {
  const gameLabels = ['A', 'B', 'C', 'D', 'E'];
  const fixedSet = new Set(fixedNumbers);
  const excludedSet = new Set(excludedNumbers);

  const games = [];

  for (let i = 0; i < gameCount; i++) {
    const label = gameLabels[i] || `${i + 1}`;
    const selectedNumbers = new Set(fixedNumbers);

    // Prepare candidate pool (1..45 minus fixed and excluded)
    const candidates = [];
    for (let num = 1; num <= 45; num++) {
      if (!fixedSet.has(num) && !excludedSet.has(num)) {
        const count = frequencies[num] || 0;
        const weight = count + baseWeight;
        candidates.push({ num, weight });
      }
    }

    // Draw remaining numbers until set has 6 numbers
    while (selectedNumbers.size < 6 && candidates.length > 0) {
      const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);

      if (totalWeight <= 0) {
        // Fallback: equal chance if total weight is 0
        const randIndex = Math.floor(Math.random() * candidates.length);
        selectedNumbers.add(candidates[randIndex].num);
        candidates.splice(randIndex, 1);
        continue;
      }

      let random = Math.random() * totalWeight;
      let chosenIndex = -1;

      for (let j = 0; j < candidates.length; j++) {
        random -= candidates[j].weight;
        if (random <= 0) {
          chosenIndex = j;
          break;
        }
      }

      if (chosenIndex === -1) {
        chosenIndex = candidates.length - 1;
      }

      const chosenNum = candidates[chosenIndex].num;
      selectedNumbers.add(chosenNum);
      candidates.splice(chosenIndex, 1);
    }

    // Convert set to array and sort ascending
    const sortedNumbers = Array.from(selectedNumbers).sort((a, b) => a - b);
    games.push({
      label,
      numbers: sortedNumbers,
    });
  }

  return games;
}

/**
 * Helper to determine Lotto Ball styling category and colors based on number range
 * 1-10: Yellow (#FBC400)
 * 11-20: Blue (#69C8F2)
 * 21-30: Red (#FF7272)
 * 31-40: Gray (#AAAAAA)
 * 41-45: Green (#B0D840)
 */
export function getLottoBallColor(number) {
  if (number >= 1 && number <= 10) {
    return {
      bg: '#FBC400',
      text: '#111827',
      border: '#E0AD00',
      gradient: 'from-amber-300 via-amber-400 to-amber-500',
      shadow: 'rgba(251, 196, 0, 0.4)',
      name: '노란색',
    };
  }
  if (number >= 11 && number <= 20) {
    return {
      bg: '#69C8F2',
      text: '#FFFFFF',
      border: '#45B2E2',
      gradient: 'from-sky-300 via-sky-400 to-sky-500',
      shadow: 'rgba(105, 200, 242, 0.4)',
      name: '파란색',
    };
  }
  if (number >= 21 && number <= 30) {
    return {
      bg: '#FF7272',
      text: '#FFFFFF',
      border: '#E85252',
      gradient: 'from-rose-400 via-rose-500 to-rose-600',
      shadow: 'rgba(255, 114, 114, 0.4)',
      name: '빨간색',
    };
  }
  if (number >= 31 && number <= 40) {
    return {
      bg: '#AAAAAA',
      text: '#FFFFFF',
      border: '#888888',
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      shadow: 'rgba(170, 170, 170, 0.4)',
      name: '회색',
    };
  }
  if (number >= 41 && number <= 45) {
    return {
      bg: '#B0D840',
      text: '#111827',
      border: '#92BA24',
      gradient: 'from-lime-400 via-lime-500 to-lime-600',
      shadow: 'rgba(176, 216, 64, 0.4)',
      name: '초록색',
    };
  }
  return {
    bg: '#CBD5E1',
    text: '#1E293B',
    border: '#94A3B8',
    gradient: 'from-slate-300 to-slate-400',
    shadow: 'rgba(203, 213, 225, 0.4)',
    name: '기본',
  };
}
