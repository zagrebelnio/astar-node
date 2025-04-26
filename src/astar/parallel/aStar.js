import { PriorityQueue } from '../core/index.js';

export class AStarParallel {
  constructor(graph, heuristic, threadCount = 4) {
    this.graph = graph;
    this.heuristic = heuristic;
    this.threadCount = threadCount;
  }

  async search(start, goal) {
    const openQueues = Array.from(
      { length: this.threadCount },
      () => new PriorityQueue()
    );
    const closedSet = new Set();
    const nodeMap = new Map();

    const key = (pos) => `${pos[0]},${pos[1]}`;

    const startNode = {
      position: start,
      g: 0,
      h: this.heuristic({ position: start }, { position: goal }),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    openQueues[0].enqueue(startNode);
    nodeMap.set(key(start), startNode);

    while (openQueues.some((q) => !q.isEmpty())) {
      const batch = openQueues.map((q) => q.dequeue()).filter(Boolean);

      for (const current of batch) {
        const currentKey = key(current.position);
        if (closedSet.has(currentKey)) continue;

        closedSet.add(currentKey);

        if (currentKey === key(goal)) {
          return this.reconstructPath(current);
        }

        const neighbors = this.graph.getNeighbors(current);
        for (const pos of neighbors) {
          const nKey = key(pos);

          if (closedSet.has(nKey)) continue;

          const g = current.g + 1;

          let neighbor = nodeMap.get(nKey);
          const h = this.heuristic({ position: pos }, { position: goal });
          const f = g + h;

          if (!neighbor || g < neighbor.g) {
            neighbor = {
              position: pos,
              g,
              h,
              f,
              parent: current,
            };
            nodeMap.set(nKey, neighbor);

            const randomQueue = Math.floor(Math.random() * this.threadCount);
            openQueues[randomQueue].enqueue(neighbor);
          }
        }
      }
    }

    return null; // path not found
  }

  reconstructPath(node) {
    const path = [];
    let current = node;
    while (current) {
      path.unshift(current.position);
      current = current.parent;
    }
    return path;
  }
}
