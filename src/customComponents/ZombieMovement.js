import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class ZombieMovement {
  constructor(
    domElement,
    node,
    {
      velocity = [0, 0, 0],
      acceleration = 30,
      maxSpeed = 2,
      decay = 0.99999,
    } = {}
  ) {
    this.node = node;
    this.domElement = domElement;

    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
    this.decay = decay;
  }

  update(t, dt) {
    // Calculate forward and right vectors.
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const forward = [0, 0, 1];
    const right = [1, 0, 0];

    // Map user input to the acceleration vector.
    const acc = vec3.create();


    vec3.sub(acc, acc, forward);
    
    // Update velocity based on acceleration.
    vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

    

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
  
}