import { AStarSequential, GridGraph, manhattan } from '../astar/index.js';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

const sizes = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
const wallDensity = 0.2;
const trials = 10;
const allowDiagonal = false;

const results = [];

function runSequential(graph, start, end) {
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

console.log('\n📏 Benchmark: Sequential A* by maze size\n');

for (const size of sizes) {
  const start = [0, 0];
  const end = [size - 1, size - 1];
  const times = [];

  for (let t = 0; t < trials; t++) {
    const graph = new GridGraph(size, allowDiagonal);
    graph.generateRandomWalls(wallDensity, [start, end]);

    const res = runSequential(graph, start, end);

    if (res.found) {
      times.push(res.time);
      console.log(`  ${size}x${size} Trial ${t + 1}: ${res.time}ms`);
    } else {
      console.log(`  ${size}x${size} Trial ${t + 1}: Not found`);
    }
  }

  const avgTime =
    times.length > 0
      ? (times.reduce((a, b) => a + b) / times.length).toFixed(2)
      : 'N/A';

  results.push({ size, avgTime });
}

fs.writeFileSync(
  path.resolve('./results/sequential.json'),
  JSON.stringify(results, null, 2)
);
