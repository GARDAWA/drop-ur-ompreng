export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
