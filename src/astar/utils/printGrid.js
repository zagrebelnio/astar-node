export function printGrid(grid, path = [], start, end) {
  const size = grid.size;
  const pathSet = new Set(path.map(([x, y]) => `${x},${y}`));

  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const key = `${x},${y}`;

      if (start[0] === x && start[1] === y) {
        row += 'S ';
      } else if (end[0] === x && end[1] === y) {
        row += 'E ';
      } else if (grid.isWall(x, y)) {
        row += '# ';
      } else if (pathSet.has(key)) {
        row += '● ';
      } else {
        row += '. ';
      }
    }
    console.log(row);
  }
}
