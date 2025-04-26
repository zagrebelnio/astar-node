export function manhattan(nodeA, nodeB) {
  const [x1, y1] = nodeA.position;
  const [x2, y2] = nodeB.position;
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
