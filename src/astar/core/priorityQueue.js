export class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(node) {
    this.items.push(node);
    this.items.sort((a, b) => a.f - b.f);
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  includes(position) {
    return this.items.some(
      (n) => n.position[0] === position[0] && n.position[1] === position[1]
    );
  }

  getNode(position) {
    return this.items.find(
      (n) => n.position[0] === position[0] && n.position[1] === position[1]
    );
  }
}
