import { quat, vec3, mat4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class Health {
  constructor(maxHealth,node){
    this.maxHealth = maxHealth;
    this.hp = maxHealth;
    this.node = node;
    this.isDead = false;
  }
  takeDMG(amount){
    let newHP = this.hp - amount;

    if(newHP <= 0){
      console.log("Object dies GAME OVER");
      this.hp = 0;
      this.die();
    }
    else{
      this.hp = newHP;
    }
    console.log(this.hp);
  }
  die(){
      this.isDead = true;
      this.node.isDynamic = false;
      console.log(this.node.isDynamic);
    }
  }

