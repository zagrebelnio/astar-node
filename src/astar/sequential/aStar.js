import { PriorityQueue } from '../core/index.js';
import { createNode, reconstructPath } from '../utils/index.js';

export class AStarSequential {
  constructor(graph, heuristic) {
    this.graph = graph;
    this.heuristic = heuristic;
  }

  search(startPos, endPos) {
    const startNode = createNode(startPos);
    const endNode = createNode(endPos);

    startNode.g = 0;
    startNode.h = this.heuristic(startNode, endNode);
    startNode.f = startNode.g + startNode.h;

    const openList = new PriorityQueue();
    const closedSet = new Set();
    const nodeMap = new Map();
    const key = (pos) => `${pos[0]},${pos[1]}`;

    openList.enqueue(startNode);
    nodeMap.set(key(startPos), startNode);

    while (!openList.isEmpty()) {
      const current = openList.dequeue();
      const cKey = key(current.position);
      if (closedSet.has(cKey)) continue;
      if (cKey === key(endPos)) return reconstructPath(current);

      closedSet.add(cKey);

      for (const neighborPos of this.graph.getNeighbors(current)) {
        const nKey = key(neighborPos);
        if (closedSet.has(nKey)) continue;

        const tentativeG = current.g + 1;
        let neighbor = nodeMap.get(nKey);

        if (!neighbor || tentativeG < neighbor.g) {
          if (!neighbor) {
            neighbor = createNode(neighborPos);
            neighbor.h = this.heuristic(neighbor, endNode);
            nodeMap.set(nKey, neighbor);
          }

          neighbor.g = tentativeG;
          neighbor.f = tentativeG + neighbor.h;
          neighbor.parent = current;
          openList.enqueue(neighbor);
        }
      }
    }

    return null;
  }
}
