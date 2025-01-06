import { vec3, vec4, quat } from "glm";
import {
    Material,
    Model,
    Node,
    Primitive,
    Sampler,
    Texture,
    Transform,
  } from "engine/core.js";

import { loadResources } from "engine/loaders/resources.js";
import { Bullet } from "./Bullet.js";

export class Weapon{
    constructor(player, transform,playerControls,bulletRes,scene){
        this.player = player;
        this.transform = transform;
        this.playerControls = playerControls;
        this.bulletRes = bulletRes;
        this.scene = scene;
      }

    update(t, dt) {
        const playerVec = vec3.fromValues(
          this.player.translation[0],
          this.player.translation[1],
          this.player.translation[2]
        );
        const transformVec = vec3.fromValues(
          this.transform.translation[0],
          this.transform.translation[1],
          this.transform.translation[2]
        );
        this.transform.translation[0] = this.player.translation[0];
        this.transform.translation[1] = this.player.translation[1];
        this.transform.translation[2] = this.player.translation[2];

        if(this.playerControls.keys["Space"]){
            this.fire();
        }
      }
    fire(){
        const bullet = new Node();
        bullet.addComponent(
            new Transform({
              translation: [this.transform.translation[0],this.transform.translation[1],this.transform.translation[2]],
              scale: [3,3,3]
            })
        )
        bullet.addComponent(
          new Model({
            primitives: [
              new Primitive({
                mesh: this.bulletRes.mesh,
                material: new Material({
                  baseTexture: new Texture({
                    image: this.bulletRes.image,
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
        bullet.addComponent(new Bullet(bullet,this.player,bullet.getComponentOfType(Transform)))
        console.log("fire");
        console.log(this.scene);
        this.scene.addChild(bullet);
      
    }
}