import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class PlayerHealth {
  constructor(maxHealth){
    this.maxHealth = maxHealth;
    this.hp = maxHealth;
  }
  takeDMG(amount){
    let newHP = this.hp - amount;

    if(newHP < 0){
      console.log("Player dies GAME OVER");
    }
    else{
      this.hp = newHP;
    }
    console.log(this.hp);
  }
  
}
