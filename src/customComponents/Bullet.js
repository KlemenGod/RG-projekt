import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class Bullet {
  constructor(
    node,
    player,
    transform,
    {
      velocity = [0, 0, 0],
      acceleration = 30,
      maxSpeed = 2,
      hit = false,
      targetPos = null,
    } = {}
  ) {
    this.node = node;
    this.player = player;
    this.transform = transform;

    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
    this.targetPos = targetPos;
   
  }

  update(t, dt) {
    // Calculate forward and right vectors.
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const forward = [0, 0, 1];
    const right = [1, 0, 0];
    const offset = [-0.45,0,-2.3];
    

    // Map user input to the acceleration vector.
    const dir = vec3.create();

    const playerVec = vec3.fromValues(
      this.player.translation[0],
      this.player.translation[1],
      this.player.translation[2]
    );
    
  
    
    this.transform.translation[2] -= 0.043;
    vec3.scaleAndAdd(this.velocity, this.velocity, dir, dt * this.acceleration);
  
    vec3.scaleAndAdd(
      this.transform.translation,
      this.transform.translation,
      this.velocity,
      dt
    );
 
    
    // Limit speed to prevent accelerating to infinity and beyond.
    const speed = vec3.length(this.velocity);
    if (speed > this.maxSpeed) {
      vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
    }

  }
  
}