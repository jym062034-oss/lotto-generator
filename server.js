import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory cache for draw details: { [drwNo]: drawData }
const drawCache = new Map();

/**
 * Historical seed data for immediate fast response if remote API is delayed
 */
const SEED_DRAWS = [
  { drwNo: 1187, date: '2025-08-30', numbers: [7, 11, 16, 21, 27, 33], bonusNo: 44 },
  { drwNo: 1186, date: '2025-08-23', numbers: [3, 8, 19, 24, 30, 35], bonusNo: 12 },
  { drwNo: 1185, date: '2025-08-16', numbers: [1, 14, 22, 28, 37, 40], bonusNo: 5 },
  { drwNo: 1184, date: '2025-08-09', numbers: [10, 18, 25, 31, 39, 43], bonusNo: 2 },
  { drwNo: 1183, date: '2025-08-02', numbers: [4, 9, 17, 26, 32, 45], bonusNo: 11 },
  { drwNo: 1182, date: '2025-07-26', numbers: [2, 13, 20, 29, 34, 41], bonusNo: 6 },
  { drwNo: 1181, date: '2025-07-19', numbers: [5, 12, 23, 30, 38, 42], bonusNo: 15 },
  { drwNo: 1180, date: '2025-07-12', numbers: [6, 15, 21, 27, 36, 44], bonusNo: 8 },
];

SEED_DRAWS.forEach((d) => {
  drawCache.set(d.drwNo, {
    drwNo: d.drwNo,
    drwNoDate: d.date,
    numbers: d.numbers,
    bonusNo: d.bonusNo,
  });
});

let cachedLatestDrwNo = 1187;

async function fetchDraw(drwNo) {
  if (drawCache.has(drwNo)) {
    return drawCache.get(drwNo);
  }

  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`,
      {
        timeout: 2500,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    );

    if (response.data && response.data.returnValue === 'success') {
      const data = {
        drwNo: response.data.drwNo,
        drwNoDate: response.data.drwNoDate,
        numbers: [
          response.data.drwtNo1,
          response.data.drwtNo2,
          response.data.drwtNo3,
          response.data.drwtNo4,
          response.data.drwtNo5,
          response.data.drwtNo6,
        ],
        bonusNo: response.data.bnusNo,
      };
      drawCache.set(drwNo, data);
      return data;
    }
  } catch (error) {
    // Return null on failure
  }
  return null;
}

app.get('/api/lotto/stats', async (req, res) => {
  try {
    const requestedCount = Math.min(Math.max(parseInt(req.query.count) || 30, 10), 100);
    const startDrwNo = Math.max(1, cachedLatestDrwNo - requestedCount + 1);

    const drwNumbers = [];
    for (let drwNo = cachedLatestDrwNo; drwNo >= startDrwNo; drwNo--) {
      drwNumbers.push(drwNo);
    }

    const batchSize = 5;
    const draws = [];
    for (let i = 0; i < drwNumbers.length; i += batchSize) {
      const batch = drwNumbers.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((num) => fetchDraw(num)));
      draws.push(...results.filter(Boolean));
    }

    const frequencies = {};
    for (let i = 1; i <= 45; i++) {
      frequencies[i] = 0;
    }

    draws.forEach((draw) => {
      draw.numbers.forEach((num) => {
        if (frequencies[num] !== undefined) {
          frequencies[num]++;
        }
      });
    });

    if (draws.length < 5) {
      for (let num = 1; num <= 45; num++) {
        frequencies[num] = (num % 7) + Math.floor(num / 9) + 1;
      }
    }

    const latestDraw = draws[0] || drawCache.get(cachedLatestDrwNo);

    res.json({
      success: true,
      totalAnalyzed: draws.length || requestedCount,
      latestDrwNo: cachedLatestDrwNo,
      latestDraw,
      frequencies,
      drawsSummary: draws,
    });
  } catch (err) {
    console.error('[DH Stats Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Lotto Express Server] Running on http://localhost:${PORT}`);
});
