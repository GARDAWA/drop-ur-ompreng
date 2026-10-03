export class Camera {
  public offsetX: number = 0;
  public shakeX: number = 0;
  public shakeY: number = 0;
  private shakeDuration: number = 0;
  private initialShakeDuration: number = 0;
  private shakeIntensity: number = 0;

  public update(targetX: number, viewportWidth: number, deltaSeconds: number = 0.016): void {
    const desiredX = targetX - viewportWidth / 3;
    this.offsetX = Math.max(0, desiredX);

    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaSeconds;
      if (this.shakeDuration <= 0) {
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeDuration = 0;
      } else {
        const decay = this.shakeDuration / (this.initialShakeDuration || 1);
        // Ensure non-zero random shake
        const rx = (Math.random() - 0.5) * 2;
        const ry = (Math.random() - 0.5) * 2;
        this.shakeX = (rx === 0 ? 1 : rx) * this.shakeIntensity * decay;
        this.shakeY = (ry === 0 ? 1 : ry) * this.shakeIntensity * decay;
      }
    }
  }

  public triggerShake(intensity: number = 10, duration: number = 0.25): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.initialShakeDuration = duration;
    // Immediate shake kick
    this.shakeX = (Math.random() > 0.5 ? 1 : -1) * intensity;
    this.shakeY = (Math.random() > 0.5 ? 1 : -1) * (intensity * 0.7);
  }
}
