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
import {
  calculateAxisAlignedBoundingBox,
  mergeAxisAlignedBoundingBoxes,
} from "engine/core/MeshUtils.js";

import { loadResources } from "engine/loaders/resources.js";
import { Bullet } from "./Bullet.js";

import { SoundManager} from "./soundManger.js";
const gunsound = document.getElementById("gunsound");
const player = new SoundManager();
export class Weapon {
  constructor(player, transform, playerControls, bulletRes, scene) {
    this.player = player;
    this.transform = transform;
    this.playerControls = playerControls;
    this.bulletRes = bulletRes;
    this.scene = scene;

    this.canFire = true;
    this.canReload = false;  // you can only reload after having shot at least one bullet

    this.clipSize = 7;    // aka max number of bullets
    this.nofBullets = this.clipSize;  // current number of bullets
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

    this.transform.rotation = this.player.rotation;

    if (this.playerControls.keys["Space"] && this.canFire) {
      if (this.nofBullets > 0) {
        this.canFire = false;
        this.canReload = true;

        this.nofBullets -= 1;
        this.fire();
      }
      else {
        // play empty clip sound
      }
    }
    if (!this.playerControls.keys["Space"]) {
      this.canFire = true;
    }

    // reloading
    if (this.playerControls.keys["KeyR"] && this.canReload) {
      this.nofBullets = this.clipSize;
      this.canReload = false;
      // play reload sound
    }
  }
  fire() {
    player.play(gunsound);

    const bullet = new Node();
    bullet.addComponent(
      new Transform({
        translation: [this.transform.translation[0], this.transform.translation[1], this.transform.translation[2]],
        scale: [3, 3, 3],
        rotation:  [this.transform.rotation[0],this.transform.rotation[1],this.transform.rotation[2], this.transform.rotation[3]],
       
      })
    );
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

    bullet.addComponent(
      new Bullet(bullet, this.player, bullet.getComponentOfType(Transform))
    );
    
    const model = bullet.getComponentOfType(Model);
    if (!model) {
      return;
    }

    const boxes = model.primitives.map((primitive) =>
      calculateAxisAlignedBoundingBox(primitive.mesh)
    );

    bullet.aabb = mergeAxisAlignedBoundingBoxes(boxes);

    
    bullet.isDynamic = true;
    bullet.isBullet = true;

    this.scene.addChild(bullet);
  }
}
