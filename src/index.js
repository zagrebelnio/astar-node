import {
  GridGraph,
  manhattan,
  AStarParallel,
  printGrid,
} from './astar/index.js';
import { isValidPath } from './astar/utils/isValidPath.js';

const size = 5;
const start = [0, 0];
const end = [4, 4];

const graph = new GridGraph(size, false);
graph.generateRandomWalls(0.2, [start, end]);

const parallel = new AStarParallel(graph, manhattan, 4);

parallel.search(start, end).then((path) => {
  if (path) {
    console.log('✅ Found path:', path.length, 'steps');
    printGrid(graph, path, start, end);
    console.log('Valid path:', isValidPath(graph, path));
    console.log(path);
  } else {
    console.log('❌ No path found.');
    printGrid(graph, [], start, end);
  }
});
