import { Health } from "./Health.js";
import { ZombieMovement } from "./zombieMovement.js";
import { ZombieAttack } from "./ZombieAttack.js";
import {
  calculateAxisAlignedBoundingBox,
  mergeAxisAlignedBoundingBoxes,
} from "engine/core/MeshUtils.js";

import { Physics } from "../Physics.js";
import {
  Material,
  Model,
  Node,
  Primitive,
  Sampler,
  Texture,
  Transform,
} from "../../engine/core.js";


export class EnemySpawner {
  constructor(enemies, zombieRes, playerNode,physicsEngine, walls) {
    this.enemies = enemies;
    this.zombieRes = zombieRes;
    this.playerNode = playerNode;
    this.physicsEngine =physicsEngine;
    this.walls = walls;

    
    

    this.spawnpoints = {
      0: { translation: [-10, 0, 2], rotation: [0, -0.7071, 0, 0.7071] }, //leva stran mape
      1: { translation: [10, 0, 2], rotation: [0, 0.7071, 0, 0.7071] }, // desna stran mape
      2: { translation: [0, 0, -10], rotation: [0, 1, 0, 0] }, // zgornja stran
      3: { translation: [0, 0, 10], rotation: [0, 0, 0, 0] }, // spodnja stran
    };
  }

  spawn(n,healthfactor,speedfactor) {
    let spawnoffset = 0.5;
    let spawnloactions = [];



    for (let i = 0; i < n; i++) {
      const zombie = new Node();
      let spawnpoint = Math.floor(Math.random() * (3 - 0 + 1) + 0);
      if (spawnloactions.includes(spawnpoint)) {
        spawnoffset++;
      }
    
      
      zombie.addComponent(
        new Transform({
          translation: [
            this.spawnpoints[spawnpoint].translation[0],
            this.spawnpoints[spawnpoint].translation[1],
            this.spawnpoints[spawnpoint].translation[2],
          ],
          scale: [3, 3, 3],
          rotation: this.spawnpoints[spawnpoint].rotation,
        })
      );
      spawnloactions.push(spawnpoint);

      zombie.addComponent(
        new Model({
          primitives: [
            new Primitive({
              mesh: this.zombieRes.mesh,
              material: new Material({
                baseTexture: new Texture({
                  image: this.zombieRes.image,
                  sampler: new Sampler({
                    minFilter: "nearest",
                    magFilter: "nearest",
                    addressModeU: "repeat",
                    addressModeV: "repeat",
                  }),
                }),
              }),
            }),
          ],
        })
      );
      zombie.addComponent(
        new ZombieMovement(
          zombie,
          this.playerNode.getComponentOfType(Transform),
          zombie.getComponentOfType(Transform),
          speedfactor
        )
      );
      zombie.addComponent(
        new ZombieAttack(
          zombie,
          this.playerNode.getComponentOfType(Transform),
          this.playerNode.getComponentOfType(Health)
        )
      );
      zombie.addComponent(new Health(15*healthfactor, zombie));

      const model = zombie.getComponentOfType(Model);
      if (!model) {
        return;
      }

      const boxes = model.primitives.map((primitive) =>
        calculateAxisAlignedBoundingBox(primitive.mesh)
      );

      zombie.aabb = mergeAxisAlignedBoundingBoxes(boxes);
      zombie.isDynamic = true;
      zombie.isEnemy = true;
      this.enemies.addChild(zombie);
    }
  }
  setSpeedfactor(speedfactor){
    this.speedfactor = speedfactor;
  }
  setHelathfactor(healthfactor){
    this.healthfactor = healthfactor;
  }
}
