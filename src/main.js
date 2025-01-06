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
  calculateAxisAlignedBoundingBox,
  mergeAxisAlignedBoundingBoxes,
} from "engine/core/MeshUtils.js";

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
import { Physics } from "./Physics.js";

const playerRes = await loadResources({
  mesh: new URL("models/player/player.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});

const zombieRes = await loadResources({
    mesh: new URL("models/player/player.obj", import.meta.url),
    image: new URL("scene/models/zombie/zombie.png", import.meta.url),
});

const canvas = document.querySelector("canvas");
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(new URL("scene/scene/scene.gltf", import.meta.url));

const scene = loader.loadScene(loader.defaultScene);
const physics = new Physics(scene);

const player = new Node();
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
player.isDynamic = true;
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

loader.loadNode("Cube").isStatic = true;
loader.loadNode("Cube.001").isStatic = true;
loader.loadNode("Cube.002").isStatic = true;
loader.loadNode("Cube.003").isStatic = true;
loader.loadNode("Plane").isStatic = true;

scene.traverse((node) => {
  const model = node.getComponentOfType(Model);
  if (!model) {
    return;
  }

  const boxes = model.primitives.map((primitive) =>
    calculateAxisAlignedBoundingBox(primitive.mesh)
  );
  node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
});
let spawnpoints = {
  0: {translation: [-10,0,2], rotation: [0,-0.7071,0,0.7071]}, //leva stran mape
  1: {translation: [10,0,2], rotation: [0,0.7071,0,0.7071]}, // desna stran mape
  2: {translation: [0,0,-10], rotation: [0,1,0,0]}, // zgornja stran
  3: {translation: [0,0,10], rotation: [0,0,0,0]}, // spodnja stran                                                      
}
let zombies = new Node();
let n = 4;
let spawnoffset = 1;
let spawnloactions = [];
for(let i=0; i < n; i++){
  const zombie = new Node();
  let spawnpoint = Math.floor(Math.random() * (3-0 + 1) + 0);
  if(spawnloactions.includes(spawnpoint)){
    spawnoffset++; 
  }
  zombie.addComponent(
      new Transform({
          translation: [spawnpoints[spawnpoint].translation[0] + spawnoffset,spawnpoints[spawnpoint].translation[1],spawnpoints[spawnpoint].translation[2]],
          scale: [3,3,3],
          rotation: spawnpoints[spawnpoint].rotation,   
      })
  );
  spawnloactions.push(spawnpoint);

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
  zombie.addComponent(new ZombieMovement(canvas,zombie,player.getComponentOfType(Transform),zombie.getComponentOfType(Transform),));
  zombies.addChild(zombie);
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

  physics.update(t, dt);
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
