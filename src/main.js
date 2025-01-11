import { GUI } from "dat";
import { mat4 } from "glm";

import * as WebGPU from "engine/WebGPU.js";
import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { UnlitRenderer } from "engine/renderers/UnlitRenderer.js";

//custpm components
import { CameraFollow } from "./customComponents/cameraFollow.js";
import { PlayerMovement } from "./customComponents/playerMovement.js";
import { PlayerControls } from "./customComponents/playerControls.js";
import { Health } from "./customComponents/Health.js";

import { RotateObject } from "./customComponents/rotateObject.js";
import { ZombieMovement} from "./customComponents/zombieMovement.js";
import  { EnemySpawner } from "./customComponents/EnemySpawner.js";
import { Weapon } from "./customComponents/Weapon.js";

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
import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
import { loadResources } from "engine/loaders/resources.js";
import { Physics } from "./Physics.js";

const playerRes = await loadResources({
  mesh: new URL("models/player/player.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});
const boxRes = await loadResources({
  mesh: new URL("models/box/box.obj", import.meta.url),
  image: new URL("models/box/boxTexture.png", import.meta.url),
});
const zombieRes = await loadResources({
    mesh: new URL("scene/models/zombie/zombie.obj", import.meta.url),
    image: new URL("scene/models/zombie/zombie.png", import.meta.url),
});
const gunRes = await loadResources({
  mesh: new URL("models/gun/gun.obj", import.meta.url),
  image: new URL("models/gun/gun_texture.png", import.meta.url),
});
const bulletRes = await loadResources({
  mesh: new URL("models/bullet/bullet.obj", import.meta.url),
  image: new URL("models/bullet/bullet.png", import.meta.url),
});

const canvas = document.querySelector("canvas");
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();

const level = await loader.load(new URL("scene/scene/scene.gltf", import.meta.url));
const scene = level.loadScene(level.defaultScene);
level.loadNode("Cube").isStatic = true;
level.loadNode("Cube.001").isStatic = true;
level.loadNode("Cube.002").isStatic = true;
level.loadNode("Cube.003").isStatic = true;
level.loadNode("Plane").isStatic = true;

/* neki sem probavu z GLTFJOM, sam nimam blage, for some reason se fizika pokvar če hočeš to naložit, specifično na 215 liniji
const zombieGLTF = await loader.load(new URL("models/zombie/zombie.gltf", import.meta.url));

const zombie = zombieGLTF.loadScene(zombieGLTF.defaultScene);
*/

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

player.addComponent(new PlayerControls(canvas,camera,player));
player.addComponent(new PlayerMovement(player,player.getComponentOfType(PlayerControls)));
player.addComponent(new Health(100));

player.isDynamic = true;
player.isPlayer = true;
const gun = new Node();
gun.addComponent(
    new Transform({
      translation: [0,0,0],
      scale: [3,3,3]
    })
)
gun.addComponent(
  new Model({
    primitives: [
      new Primitive({
        mesh: gunRes.mesh,
        material: new Material({
          baseTexture: new Texture({
            image: gunRes.image,
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

gun.addComponent(new Weapon(player.getComponentOfType(Transform),gun.getComponentOfType(Transform),player.getComponentOfType(PlayerControls),bulletRes,scene));

scene.addChild(player);
scene.addChild(gun);




let zombies = new Node();
let n = 1;
let startWave = false;
let spawner = new EnemySpawner(zombies,zombieRes,player);
spawner.spawn(n);
scene.addChild(zombies);

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


function deleteZombie(index){
  const child = zombies.children[index];
  if(child){
    setTimeout(() =>{
      zombies.removeChild(child);
      child.destroy();
    },3000);
  }
}
function update(t, dt) {
  scene.traverse((node) => {
    for (const component of node.components) {
      component.update?.(t, dt);
    }
  });

  for(const child of zombies.children){
    let index = zombies.children.indexOf(child);
    
    if(child.getComponentOfType(Health).isDead){
      deleteZombie(index);
    }
  }
  if(zombies.children.length == 0 && !startWave){
    startWave = true;
    setTimeout(() =>{
      n += 2; //increase zombie amount
      spawner.spawn(n);
      startWave = false;
      
    },5000);
  }
  
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
