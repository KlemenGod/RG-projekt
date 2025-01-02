import { GUI } from "dat";
import { mat4 } from "glm";

import * as WebGPU from "engine/WebGPU.js";
import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { UnlitRenderer } from "engine/renderers/UnlitRenderer.js";

//custpm components
import { CameraFollow } from "./customComponents/cameraFollow.js";
import { PlayerMovement } from "./customComponents/playerMovement.js";
import { RotateObject } from "./customComponents/rotateObject.js";

import {
  Camera,
  Material,
  Model,
  Node,
  Primitive,
  Sampler,
  Texture,
  Transform,
} from "engine/core.js";

import { loadResources } from "engine/loaders/resources.js";

const resources = await loadResources({
  mesh: new URL("scene/models/floor/floor.json", import.meta.url),
  image: new URL("scene/models/floor/grass.png", import.meta.url),
});
const playerRes = await loadResources({
  mesh: new URL("models/player/player.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});

const canvas = document.querySelector("canvas");
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const scene = new Node();

const player = new Node();
player.addComponent(new Transform());
player.addComponent(
  new Transform({
    translation: [0, 0, 0],
    scale: [3, 3, 3],
  })
);
player.addComponent(
  new Model({
    primitives: [
      new Primitive({
        mesh: playerRes.mesh,
        material: new Material({
          baseTexture: new Texture({
            image: playerRes.image,
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

player.addComponent(new PlayerMovement(canvas, player));
scene.addChild(player);

const cameraHolder = new Node();
cameraHolder.addComponent(new Transform());
cameraHolder.addComponent(
  new CameraFollow(
    player.getComponentOfType(Transform),
    cameraHolder.getComponentOfType(Transform),
    {
      offset: [0, 5, 6],
      lookAngle: -40,
    }
  )
);

const camera = new Node();
camera.addComponent(new Transform());
camera.addComponent(new Camera());
cameraHolder.addChild(camera);

scene.addChild(cameraHolder);

const floor = new Node();
floor.addComponent(
  new Transform({
    scale: [10, 1, 10],
  })
);
floor.addComponent(
  new Model({
    primitives: [
      new Primitive({
        mesh: resources.mesh,
        material: new Material({
          baseTexture: new Texture({
            image: resources.image,
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
scene.addChild(floor);

function update(t, dt) {
  scene.traverse((node) => {
    for (const component of node.components) {
      component.update?.(t, dt);
    }
  });
}

function render() {
  renderer.render(scene, camera);
}

function resize({ displaySize: { width, height } }) {
  camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();

//const gui = new GUI();
//const controller = camera.getComponentOfType(FirstPersonController);
//gui.add(controller, "pointerSensitivity", 0.0001, 0.01);
//gui.add(controller, "maxSpeed", 0, 10);
//gui.add(controller, "decay", 0, 1);
//gui.add(controller, "acceleration", 1, 100);
