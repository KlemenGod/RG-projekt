import { vec3, vec4, quat } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class RotateObject {
  constructor(node, { rotation = [[0.01, 0, 0]], speed = 1 } = {}) {
    this.node = node;
    this.rotation = rotation;
    this.speed = speed;
    this.transform = this.node.getComponentOfType(Transform);
  }

  update(t, dt) {
    quat.rotateX(
      this.transform.rotation,
      this.transform.rotation,
      this.rotation[0] * dt * this.speed
    );
    quat.rotateY(
      this.transform.rotation,
      this.transform.rotation,
      this.rotation[1] * dt * this.speed
    );
    quat.rotateZ(
      this.transform.rotation,
      this.transform.rotation,
      this.rotation[2] * dt * this.speed
    );
    // this.transform.rotation[0] += this.rotation[0] * dt * this.speed;
    // this.transform.rotation[1] += this.rotation[1] * dt * this.speed;
    // this.transform.rotation[2] += this.rotation[2] * dt * this.speed;
    // this.transform.rotation[3] += this.rotation[3] * dt * this.speed;
  }
}
