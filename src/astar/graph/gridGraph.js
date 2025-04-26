export class GridGraph {
  constructor(size, allowDiagonal = false) {
    this.size = size;
    this.allowDiagonal = allowDiagonal;
    this.walls = new Set();
  }

  clone() {
    const newGraph = new GridGraph(this.size, this.allowDiagonal);
    newGraph.walls = new Set([...this.walls]);
    return newGraph;
  }

  addWall(x, y) {
    this.walls.add(`${x},${y}`);
  }

  isWall(x, y) {
    return this.walls.has(`${x},${y}`);
  }

  getNeighbors(node) {
    const [x, y] = node.position;
    const basicDirections = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    const diagonalDirections = [
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];

    const directions = this.allowDiagonal
      ? [...basicDirections, ...diagonalDirections]
      : basicDirections;

    const neighbors = [];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 &&
        ny >= 0 &&
        nx < this.size &&
        ny < this.size &&
        !this.isWall(nx, ny)
      ) {
        neighbors.push([nx, ny]);
      }
    }

    return neighbors;
  }

  generateRandomWalls(percent = 0.2, exclude = []) {
    const totalCells = this.size * this.size;
    const wallCount = Math.floor(totalCells * percent);

    while (this.walls.size < wallCount) {
      const x = Math.floor(Math.random() * this.size);
      const y = Math.floor(Math.random() * this.size);
      const key = `${x},${y}`;

      if (!exclude.some(([ex, ey]) => ex === x && ey === y)) {
        this.walls.add(key);
      }
    }
  }
}
