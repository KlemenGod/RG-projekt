import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class ZombieAttack {
  constructor(
    node,
    player,
    playerHP,
    {
      canAttack = true,
      attackCooldown = 1.5,

    } = {}
  ) {
    this.node = node;
    this.player = player;
    this.playerHP = playerHP;

    this.canAttack = canAttack;
    this.attackCooldown= attackCooldown;
    this.cooldowntime = 0;
  }

  update(t, dt) {
    
    const playerVec = vec3.fromValues(
        this.player.translation[0],
        this.player.translation[1],
        this.player.translation[2]
    );
    const zombieTransform = this.node.getComponentOfType(Transform);
    if (vec3.distance(zombieTransform.translation, playerVec) <= 1.4) {
      if (this.canAttack) {
        this.attack();
        this.canAttack = false;
        this.cooldowntime = this.attackCooldown;  
      }
      else{
        console.log("attack on cooldown");
      }
    }
   
    if(this.canAttack == false){
      this.cooldowntime -= dt;
      if(this.cooldowntime <= 0){
        this.canAttack = true;
      }
    }
  }
  attack() {
    const zombieTransform = this.node.getComponentOfType(Transform);
    const forward = [0, 0, -1];
    console.log("attack player");

    
    const knockbackdir = vec3.create();
    vec3.transformQuat(knockbackdir,forward,zombieTransform.rotation);
    vec3.normalize(knockbackdir,knockbackdir);

    this.player.translation = [
      this.player.translation[0] += knockbackdir[0] * 0.2,
      this.player.translation[1] += knockbackdir[1] * 0.2,
      this.player.translation[2] += knockbackdir[2] * 0.2,
    ];


    this.playerHP.takeDMG(5);
  }
}
