import {
  GridGraph,
  manhattan,
  AStarParallel,
  printGrid,
} from './astar/index.js';

const size = 16;
const start = [0, 0];
const end = [15, 15];

const graph = new GridGraph(size, true);
graph.generateRandomWalls(0.2, [start, end]);

const parallel = new AStarParallel(graph, manhattan, 4);

parallel.search(start, end).then((path) => {
  if (path) {
    console.log('✅ Found path:', path.length, 'steps');
    printGrid(graph, path, start, end);
  } else {
    console.log('❌ No path found.');
    printGrid(graph, [], start, end);
  }
});
