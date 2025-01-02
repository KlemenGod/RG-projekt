import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class PlayerMovement {
  constructor(
    domElement,
    node,
    {
      velocity = [0, 0, 0],
      acceleration = 50,
      maxSpeed = 5,
      decay = 0.99999,
    } = {}
  ) {
    this.node = node;
    this.domElement = domElement;

    this.keys = {};

    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
    this.decay = decay;

    this.initHandlers();
  }

  initHandlers() {
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);

    const element = this.domElement;
    const doc = element.ownerDocument;

    doc.addEventListener("keydown", this.keydownHandler);
    doc.addEventListener("keyup", this.keyupHandler);
  }

  update(t, dt) {
    // Calculate forward and right vectors.
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const forward = [0, 0, 1];
    const right = [1, 0, 0];

    // Map user input to the acceleration vector.
    const acc = vec3.create();
    if (this.keys["KeyW"]) {
      vec3.sub(acc, acc, forward);
    }
    if (this.keys["KeyS"]) {
      vec3.add(acc, acc, forward);
    }
    if (this.keys["KeyD"]) {
      vec3.add(acc, acc, right);
    }
    if (this.keys["KeyA"]) {
      vec3.sub(acc, acc, right);
    }

    // Update velocity based on acceleration.
    vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

    // If there is no user input, apply decay.
    if (
      !this.keys["KeyW"] &&
      !this.keys["KeyS"] &&
      !this.keys["KeyD"] &&
      !this.keys["KeyA"]
    ) {
      const decay = Math.exp(dt * Math.log(1 - this.decay));
      vec3.scale(this.velocity, this.velocity, decay);
    }

    // Limit speed to prevent accelerating to infinity and beyond.
    const speed = vec3.length(this.velocity);
    if (speed > this.maxSpeed) {
      vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
    }

    const transform = this.node.getComponentOfType(Transform);
    if (transform) {
      // Update translation based on velocity.
      vec3.scaleAndAdd(
        transform.translation,
        transform.translation,
        this.velocity,
        dt
      );

      // Update rotation based on the Euler angles.
      // const rotation = quat.create();
      // quat.rotateY(rotation, rotation, this.yaw);
      // quat.rotateX(rotation, rotation, this.pitch);
      // transform.rotation = rotation;
    }
  }

  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }
}
