import {
  AStarSequential,
  AStarParallel,
  GridGraph,
  manhattan,
} from '../astar/index.js';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 64, 128, 256, 512];
const threadCounts = [2, 4, 8, 16];
const wallDensity = 0.2;
const trials = 10;
const allowDiagonal = false;

const results = [];

function runTestSequential(graph, start, end) {
  const aStar = new AStarSequential(graph, manhattan);
  const t0 = performance.now();
  const path = aStar.search(start, end);
  const t1 = performance.now();

  return {
    found: !!path,
    steps: path?.length || 0,
    time: +(t1 - t0).toFixed(2),
  };
}

async function runTestParallel(graph, start, end, threads) {
  const aStar = new AStarParallel(graph, manhattan, threads);
  const t0 = performance.now();
  const path = await aStar.search(start, end);
  const t1 = performance.now();

  return {
    found: !!path,
    steps: path?.length || 0,
    time: +(t1 - t0).toFixed(2),
  };
}

console.log(`\n🔬 A* Benchmark: Sequential vs Parallel (same maps)`);
console.log(
  `Wall density: ${
    wallDensity * 100
  }% | Trials per case: ${trials} | Diagonal movenemt: ${allowDiagonal}\n`
);

for (const size of sizes) {
  console.log(`🧩 Grid: ${size}x${size}`);
  const start = [0, 0];
  const end = [size - 1, size - 1];

  for (let t = 0; t < trials; t++) {
    const original = new GridGraph(size, allowDiagonal);
    original.generateRandomWalls(wallDensity, [start, end]);

    // === Sequential
    const graphSeq = original.clone();
    const seq = runTestSequential(graphSeq, start, end);

    console.log(
      `  Trial ${t + 1} (Sequential): Path=${seq.found} Steps=${
        seq.steps
      } Time=${seq.time}ms`
    );

    const trialResults = {
      grid: `${size}x${size}`,
      trial: t + 1,
      sequential: seq,
      parallel: [],
    };

    // === Parallel
    for (const threads of threadCounts) {
      const graphPar = original.clone();
      const par = await runTestParallel(graphPar, start, end, threads);

      const speedUp = (seq.time / par.time).toFixed(2);

      console.log(
        `    ↳ Parallel (${threads} threads): Path=${par.found} Steps=${par.steps} Time=${par.time}ms Speed-up: ${speedUp}x`
      );

      trialResults.parallel.push({
        threads,
        ...par,
        speedup: speedUp,
      });
    }

    results.push(trialResults);
  }

  console.log('---');
}

const outputPath = path.resolve('./results/results.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
