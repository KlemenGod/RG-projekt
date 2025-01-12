import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";
import { Health } from "./Health.js";
import { RotateAnimator } from "../../engine/animators/RotateAnimator.js";
import { ZombieAttack } from "./ZombieAttack.js";

import { SoundManager} from "./soundManger.js"
let zombieSound = new Audio("./audio/zombie_growl.mp3");
zombieSound.preload = 'auto';
zombieSound.load();
const player = new SoundManager();

export class ZombieMovement {
  deathPlayed = false;
  constructor(
    node,
    player,
    transform,
    speedfactor,
    {
      velocity = [0, 0, 0],
      acceleration = 30,
      maxSpeed = 1,
      decay = 0.99999,
      targetPos = null,
    } = {}
  ) {
    this.node = node;
    this.player = player;
    this.transform = transform;
    this.speedfactor = speedfactor;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
    this.decay = decay;
    this.targetPos = targetPos;

  }

  update(t, dt) {
    // Calculate forward and right vectors.
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const forward = [0, 0, 1];
    const right = [1, 0, 0];
    const offset = [-0.45, 0, -2.3];

    const isDead = this.node.getComponentOfType(Health).isDead;

    
    player.play(zombieSound);

    // Map user input to the acceleration vector.
    const dir = vec3.create();

    const playerVec = vec3.fromValues(
      this.player.translation[0],
      this.player.translation[1],
      this.player.translation[2]
    );

    vec3.sub(dir, playerVec, this.transform.translation);
    vec3.normalize(dir, dir);
    vec3.scaleAndAdd(this.velocity, this.velocity, dir, dt * this.acceleration);
    vec3.scale(this.velocity, this.velocity, this.speedfactor);
    if (vec3.distance(this.transform.translation, playerVec) <= 1.4) {
      this.velocity = [0, 0, 0];
    }
    vec3.scaleAndAdd(
      this.transform.translation,
      this.transform.translation,
      this.velocity,
      dt
    );
    const zombieforward = vec3.fromValues(0, 0, -1);
    const rotation = quat.create();
    quat.rotationTo(rotation, zombieforward, dir);

    this.transform.rotation = rotation;

    // Update velocity based on acceleration.

    // Limit speed to prevent accelerating to infinity and beyond.
    const speed = vec3.length(this.velocity);
    if (speed > this.maxSpeed) {
      vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
    }
    if (isDead) {
      //this.transform.rotation = [-0.7071,0,0,0.7071];
      if (!this.deathPlayed) {
        //samo enkrat
        this.deathPlayed = true;

        this.node.addComponent(
          new RotateAnimator(this.node, {
            startRotation: this.transform.rotation,
            duration: 1,
            startTime: t,
          })
        );
        quat.setAxisAngle(
          this.node.getComponentOfType(RotateAnimator).endRotation,
          dir,
          Math.PI / 2
        );
        //this.node.getComponentOfType(RotateAnimator).play();
      }

      //this.transform.translation[1] += 0.2;

      this.node.removeComponentsOfType(ZombieMovement);
      this.node.removeComponentsOfType(ZombieAttack);
    }
  }
}
