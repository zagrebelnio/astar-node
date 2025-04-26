export function reconstructPath(endNode) {
  const path = [];
  let current = endNode;
  while (current) {
    path.unshift(current.position);
    current = current.parent;
  }
  return path;
}
