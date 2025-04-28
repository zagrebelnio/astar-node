export function isValidPath(graph, path) {
  if (!path || path.length === 0) return false;

  for (let i = 1; i < path.length; i++) {
    const [x1, y1] = path[i - 1];
    const [x2, y2] = path[i];

    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);

    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
      return false; // Некоректний рух (не сусідні клітинки)
    }

    if (graph.isWall(x2, y2)) {
      return false; // Пройшли через стіну
    }
  }

  return true;
}
