import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";


export class Bullet {
  constructor(
    node,
    player,
    transform,
    {
      velocity = [0, 0, 0],
      acceleration = 60,
      maxSpeed = 10,
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
    const forward = [0, 0, -1];
    const right = [1, 0, 0];
    const offset = [-0.45,0,-2.3];
    

    // Map user input to the acceleration vector.
    const bulletdir = vec3.create();
    vec3.transformQuat(bulletdir,forward,this.transform.rotation);
    vec3.normalize(bulletdir,bulletdir);

    const playerVec = vec3.fromValues(
      this.player.translation[0],
      this.player.translation[1],
      this.player.translation[2]
    );
    
    
  
    
    vec3.scaleAndAdd(this.velocity, this.velocity, bulletdir, dt * this.acceleration);
  
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
  onHit(dmg,healthcontroller){
    healthcontroller.takeDMG(dmg);
  }
  destroy(){
    this.node = null;
    this.player = null;
    this.transform = null;

  }
}