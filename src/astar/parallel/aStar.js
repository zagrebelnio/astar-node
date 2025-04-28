import { Worker } from 'node:worker_threads';
import path from 'path';

export class AStarParallel {
  constructor(graph, heuristic, threadCount = 4) {
    this.graph = graph;
    this.heuristic = heuristic;
    this.threadCount = threadCount;
    this.workers = [];
    this.workerQueues = new Map(); // id -> worker
  }

  async search(start, goal) {
    function fixPath(path, start) {
      if (!path || path.length === 0) return [start];

      const [firstX, firstY] = path[0];
      if (firstX !== start[0] || firstY !== start[1]) {
        return [start, ...path];
      }

      return path;
    }

    return new Promise((resolve, reject) => {
      let finished = false;
      let notFoundCount = 0;

      const sharedData = {
        size: this.graph.size,
        walls: [...this.graph.walls],
        allowDiagonal: this.graph.allowDiagonal,
        goal,
        heuristicName: this.heuristic.name,
      };

      const neighbors = this.graph.getNeighbors({ position: start });
      const startingPoints =
        neighbors.length >= this.threadCount
          ? neighbors.slice(0, this.threadCount)
          : neighbors.concat(
              Array(this.threadCount - neighbors.length).fill(start)
            );

      for (let i = 0; i < this.threadCount; i++) {
        const worker = new Worker(
          path.resolve('./src/astar/parallel/workers/worker.js'),
          {
            workerData: {
              id: i,
              threadCount: this.threadCount,
              sharedData,
              startPoint: startingPoints[i],
            },
          }
        );

        this.workerQueues.set(i, worker);

        worker.on('message', (msg) => {
          if (msg.type === 'found' && !finished) {
            finished = true;
            const fullPath = fixPath(msg.path, start); // ➡️ додаємо стартову вершину!
            resolve(fullPath);
            this.workers.forEach((w) => w.terminate());
          } else if (msg.type === 'not_found') {
            notFoundCount++;
            if (notFoundCount === this.threadCount && !finished) {
              finished = true;
              resolve(null);
            }
          } else if (msg.type === 'steal') {
            this.handleStealRequest(msg.id);
          }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0 && !finished) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });

        this.workers.push(worker);
      }
    });
  }

  handleStealRequest(stealerId) {
    for (const [id, worker] of this.workerQueues) {
      if (id !== stealerId) {
        worker.postMessage({ type: 'give_work', to: stealerId });
        return;
      }
    }
    // Якщо ніхто не може віддати роботу, надсилаємо terminate
    const stealer = this.workerQueues.get(stealerId);
    if (stealer) {
      stealer.postMessage({ type: 'terminate' });
    }
  }
}
