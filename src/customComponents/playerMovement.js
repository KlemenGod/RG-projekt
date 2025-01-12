import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";
import { WalkingAnimator } from "./WalkingAnimator.js";

export class PlayerMovement {
  constructor(
    node,
    playerControls,
    leftArm,
    leftLeg,
    rightLeg,
    {
      velocity = [0, 0, 0],
      acceleration = 50,
      maxSpeed = 5,
      decay = 0.99999,
    } = {}
  ) {
    this.node = node;
    this.playerControls = playerControls;
    this.leftArm = leftArm;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;

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
    if (this.playerControls.keys["KeyW"]) {
      vec3.sub(acc, acc, forward);
      this.startAnimation();
    }
    if (this.playerControls.keys["KeyS"]) {
      vec3.add(acc, acc, forward);
      this.startAnimation();
    }
    if (this.playerControls.keys["KeyD"]) {
      vec3.add(acc, acc, right);
      this.startAnimation();
    }
    if (this.playerControls.keys["KeyA"]) {
      vec3.sub(acc, acc, right);
      this.startAnimation();
    }

    // Update velocity based on acceleration.
    vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

    // If there is no user input, apply decay. And stop the walking animation
    if (
      !this.playerControls.keys["KeyW"] &&
      !this.playerControls.keys["KeyS"] &&
      !this.playerControls.keys["KeyD"] &&
      !this.playerControls.keys["KeyA"]
    ) {
      const decay = Math.exp(dt * Math.log(1 - this.decay));
      vec3.scale(this.velocity, this.velocity, decay);

      this.stopAnimation();
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

  startAnimation() {
    this.leftArm.getComponentOfType(WalkingAnimator).play();
    this.leftLeg.getComponentOfType(WalkingAnimator).play();
    this.rightLeg.getComponentOfType(WalkingAnimator).play();
  }

  stopAnimation() {
    this.leftArm.getComponentOfType(WalkingAnimator).reset();
    this.leftLeg.getComponentOfType(WalkingAnimator).reset();
    this.rightLeg.getComponentOfType(WalkingAnimator).reset();
  }
}
