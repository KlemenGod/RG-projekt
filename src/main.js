import { GUI } from "dat";
import { mat4 } from "glm";

import * as WebGPU from "engine/WebGPU.js";
import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { UnlitRenderer } from "engine/renderers/UnlitRenderer.js";

import { FirstPersonController } from "engine/controllers/FirstPersonController.js";

import { ZombieMovement} from "./customComponents/zombieMovement.js";

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

const zombieRes = await loadResources({
    mesh: new URL("scene/models/zombie/zombie.obj", import.meta.url),
    image: new URL("scene/models/zombie/zombie.png", import.meta.url),
});

const canvas = document.querySelector("canvas");
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const scene = new Node();

const cameraHolder = new Node();
cameraHolder.addComponent(
  new Transform({
    translation: [0, 5, 10],

  })
);
cameraHolder.getComponentOfType(Transform).rotateX(-0.4);

const camera = new Node();
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
let zombies = new Node();
let n = 4;
let x = -1;
for(let i=0; i < n; i++){
  const zombie = new Node();
  zombie.addComponent(
      new Transform({
          translation: [x,1,10],
          scale: [3,3,3],   
      })
  );
  
  zombie.addComponent(
      new Model({
        primitives: [
          new Primitive({
            mesh: zombieRes.mesh,
            material: new Material({
              baseTexture: new Texture({
                image: zombieRes.image,
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
  zombie.addComponent(new ZombieMovement(canvas,zombie));
  zombies.addChild(zombie);
  x++;
}
scene.addChild(zombies);


function deleteZombie(index){
  const child = zombies.children[index];
  if(child){
    child.destroy();
    zombies.removeChild(child);
  }
}
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
