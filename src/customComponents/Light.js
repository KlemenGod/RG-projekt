export class Light {
  constructor({ color = [255, 255, 255], direction = [0, 0, 1], ambientLight = [0.3,0.3,0.3] } = {}) {
    this.color = color;
    this.direction = direction;
    this.ambientLight = ambientLight;
  }
}
