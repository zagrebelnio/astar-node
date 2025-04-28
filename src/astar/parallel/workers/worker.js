import { parentPort, workerData } from 'node:worker_threads';
import { PriorityQueue } from '../../core/index.js';
import { manhattan } from '../../heuristics/index.js';
import { GridGraph } from '../../graph/gridGraph.js';

const { id, threadCount, sharedData, startPoint } = workerData;

const graph = new GridGraph(
  sharedData.size,
  sharedData.walls,
  sharedData.allowDiagonal
);
const heuristic =
  sharedData.heuristicName === 'manhattan' ? manhattan : manhattan;

const openList = new PriorityQueue();
const closedSet = new Set();
const nodeMap = new Map();

const key = (pos) => `${pos[0]},${pos[1]}`;

const startNode = {
  position: startPoint,
  g: 1,
  h: heuristic({ position: startPoint }, { position: sharedData.goal }),
  f: 0,
  parent: null,
};

startNode.f = startNode.g + startNode.h;
openList.enqueue(startNode);
nodeMap.set(key(startPoint), startNode);

function reconstructPath(node) {
  const path = [];
  let current = node;
  while (current) {
    path.unshift(current.position);
    current = current.parent;
  }
  return path;
}

parentPort.on('message', (msg) => {
  if (msg.type === 'steal_batch') {
    for (const nodeData of msg.batch) {
      openList.enqueue(nodeData);
    }
  } else if (msg.type === 'terminate') {
    parentPort.postMessage({ type: 'not_found' });
    process.exit(0);
  }
});

const BATCH_SIZE = 256;

(async function run() {
  while (true) {
    const batch = [];
    for (let i = 0; i < BATCH_SIZE && !openList.isEmpty(); i++) {
      const node = openList.dequeue();
      if (node) batch.push(node);
    }

    if (batch.length === 0) {
      parentPort.postMessage({ type: 'steal', id });
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (openList.isEmpty()) {
        parentPort.postMessage({ type: 'not_found' });
        return;
      }
      continue;
    }

    for (const current of batch) {
      const currentKey = key(current.position);

      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);

      if (currentKey === key(sharedData.goal)) {
        const path = reconstructPath(current);
        parentPort.postMessage({ type: 'found', path });
        return;
      }

      for (const neighborPos of graph.getNeighbors({
        position: current.position,
      })) {
        const nKey = key(neighborPos);
        if (closedSet.has(nKey)) continue;

        const tentativeG = current.g + 1;
        let neighbor = nodeMap.get(nKey);
        const h = heuristic(
          { position: neighborPos },
          { position: sharedData.goal }
        );
        const f = tentativeG + h;

        if (!neighbor || tentativeG < neighbor.g) {
          neighbor = {
            position: neighborPos,
            g: tentativeG,
            h,
            f,
            parent: current,
          };
          nodeMap.set(nKey, neighbor);
          openList.enqueue(neighbor);
        }
      }
    }
  }
})();
