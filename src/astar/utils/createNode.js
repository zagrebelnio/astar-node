export function createNode(position) {
  return {
    position, // [x, y]
    g: Infinity,
    h: Infinity,
    f: Infinity,
    parent: null,
  };
}
