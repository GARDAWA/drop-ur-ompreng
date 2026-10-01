export class Camera {
  public offsetX: number = 0;

  public update(targetX: number, viewportWidth: number): void {
    const desiredX = targetX - viewportWidth / 3;
    this.offsetX = Math.max(0, desiredX);
  }
}
