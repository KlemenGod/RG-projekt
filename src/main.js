import { GUI } from "dat";
import { mat4, quat } from "glm";

import * as WebGPU from "engine/WebGPU.js";
import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { UnlitRenderer } from "engine/renderers/UnlitRenderer.js";
import { LambertRenderer } from "engine/renderers/LambertRenderer.js"


//custpm components
import { CameraFollow } from "./customComponents/cameraFollow.js";
import { PlayerMovement } from "./customComponents/playerMovement.js";
import { PlayerControls } from "./customComponents/playerControls.js";
import { Health } from "./customComponents/Health.js";

import { RotateObject } from "./customComponents/rotateObject.js";
import { ZombieMovement} from "./customComponents/zombieMovement.js";
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
import { GameUI } from "./gameUI.js";
import { Light } from "./customComponents/Light.js";

const playerRes = await loadResources({
  mesh: new URL("models/player/player.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});

const zombieRes = await loadResources({
  mesh: new URL("scene/models/zombie/test.obj", import.meta.url),
  image: new URL("scene/models/zombie/zombiecolor.png", import.meta.url),
});

const bulletRes = await loadResources({
  mesh: new URL("models/bullet/bullet.obj", import.meta.url),
  image: new URL("models/bullet/bullet.png", import.meta.url),
});

const canvas = document.querySelector("canvas");
const renderer = new LambertRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(new URL("scene/scene/scene.gltf", import.meta.url));

const scene = loader.loadScene(loader.defaultScene);
const physics = new Physics(scene);  

const light = new Node();
light.addComponent(new Light({direction: [2,6,1],ambientLight: [0.5,0.5,0.5]}));
scene.addChild(light);


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
player.isDynamic = true;
const cameraHolder = new Node();
cameraHolder.addComponent(
  new Transform({
    translation: [0, 1, 3],
  })
);


const camera = new Node();
camera.addComponent(new Transform());

camera.addComponent(new Camera());
cameraHolder.addChild(camera);

scene.addChild(cameraHolder);

scene.addChild(player);



loader.loadNode("Cube").isStatic = true;
loader.loadNode("Cube.001").isStatic = true;
loader.loadNode("Cube.002").isStatic = true;
loader.loadNode("Cube.003").isStatic = true;
loader.loadNode("Plane").isStatic = true;




function cleanGameScene() {
  //player
  player.removeComponentsOfType(PlayerControls);

  //camera
  cameraHolder.removeComponentsOfType(CameraFollow);

  
}
function cleanMenuScene() {
  scene.removeChildrenByName("menuSceneDeco");
}

function generateGameScene(index) {
  /*
  //player
  player.addComponent(new PlayerControls(canvas,camera,player));
  player.addComponent(new PlayerMovement(player,player.getComponentOfType(PlayerControls)));

  //camera
  cameraHolder.addComponent(new CameraFollow(
      player.getComponentOfType(Transform),
      cameraHolder.getComponentOfType(Transform),
      {
        offset: [0, 5, 6],
        lookAngle: -40,
      }
    ));
    */
   import('./main_2.js').then((main_2) => {
    main_2.initUI();
    main_2.initSound();
    main_2.inittLevel(index);

    console.log("game loop started");
    
   });
}
function generateMenuScene() {
  //player
  
  player.getComponentOfType(Transform).translation = [0.5, 0, 1];
  quat.fromEuler(player.getComponentOfType(Transform).rotation, 0, 34, 0);

  //camera
  quat.fromEuler(cameraHolder.getComponentOfType(Transform).rotation, 0, 20, -10);

  //zombies
  const zombie1 = new Node();
  zombie1.name = "menuSceneDeco";
  zombie1.addComponent(
    new Transform({
      translation: [-3, 0, -4],
      scale: [3, 3, 3],
    })
  );
  quat.fromEuler(zombie1.getComponentOfType(Transform).rotation, 0, -135, 0);
  zombie1.addComponent(
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
  scene.addChild(zombie1);

  const zombie2 = new Node();
  zombie2.name = "menuSceneDeco";
  zombie2.addComponent(
    new Transform({
      translation: [-2.5, 0, 1],
      scale: [3, 3, 3],
    })
  );
  quat.fromEuler(zombie2.getComponentOfType(Transform).rotation, 0, -90, 0);
  zombie2.addComponent(
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
  scene.addChild(zombie2);
}
const ui = new GameUI(loadLevel, 0);
function loadLevel(index) {
  console.log("load level: ", index);
  if(index == 0){
    cleanGameScene();
    generateMenuScene();
  }
  else {
    cleanMenuScene();
    generateGameScene(index);
  }
  /*
  if(index == 1){
    cleanMenuScene();
    generateGameScene();
  }
  if(index == 2){
    console.log("load level 2");
  }
    */
}

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