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
import { Light } from "./customComponents/Light.js";
import { SoundManager} from "./customComponents/soundManger.js";
import { WalkingAnimator } from "./customComponents/WalkingAnimator.js";

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
import { GameUI } from "./gameUI.js";

const playerRes = await loadResources({
  mesh: new URL("models/player/fullbody.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});
const boxRes = await loadResources({
  mesh: new URL("models/box/box.obj", import.meta.url),
  image: new URL("models/box/boxTexture.png", import.meta.url),
});
const zombieRes = await loadResources({
    mesh: new URL("scene/models/zombie/test.obj", import.meta.url),
    image: new URL("scene/models/zombie/zombiecolor.png", import.meta.url),
});
const gunRes = await loadResources({
  mesh: new URL("models/gun/pistol.obj", import.meta.url),
  image: new URL("models/gun/gun_texture.png", import.meta.url),
});
const bulletRes = await loadResources({
  mesh: new URL("models/bullet/bullet_3.obj", import.meta.url),
  image: new URL("models/bullet/bullet.png", import.meta.url),
});

// player by parts
const playerBody = await loadResources({
  mesh: new URL("models/player/body.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});
const playerLeftArm = await loadResources({
  mesh: new URL("models/player/leftarm.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});
const playerLeftLeg = await loadResources({
  mesh: new URL("models/player/leftleg.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});
const playerRightLeg = await loadResources({
  mesh: new URL("models/player/rightleg.obj", import.meta.url),
  image: new URL("models/player/playerTexture.png", import.meta.url),
});

const canvas = document.querySelector("canvas");


//const renderer = new UnlitRenderer(canvas);
const renderer = new LambertRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();

const level = await loader.load(new URL("scene/scene/scene.gltf", import.meta.url));
const scene = level.loadScene(level.defaultScene);





level.loadNode("Cube").isStatic = true;
level.loadNode("Cube.001").isStatic = true;
level.loadNode("Cube.002").isStatic = true;
level.loadNode("Cube.003").isStatic = true;
level.loadNode("Plane").isStatic = true;

const light = new Node();
light.addComponent(new Light({direction: [2,6,1],ambientLight: [0.5,0.5,0.5]}));
scene.addChild(light);

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
        mesh: playerBody.mesh,
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



// player arm and legs
const leftArm = new Node();
leftArm.addComponent(new Transform());
leftArm.addComponent(
  new Model({
    primitives: [
      new Primitive({
        mesh: playerLeftArm.mesh,
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
leftArm.addComponent(new WalkingAnimator(leftArm,
  {
   startRotation: quat.fromEuler([], 30, 0, 0),
   endRotation: quat.fromEuler([], -30, 0, 0),
  },
  {
    startPosition: quat.fromEuler([], 0, 2, -27),
    endPosition: quat.fromEuler([], 0, 2, 27),
  },
  0,    // startTime
  1,  // duration
  true  // loop?
));
player.addChild(leftArm);

const leftLeg = new Node();
leftLeg.addComponent(new Transform());
leftLeg.addComponent(
  new Model({
    primitives: [
      new Primitive({
        mesh: playerLeftLeg.mesh,
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
leftLeg.addComponent(new WalkingAnimator(leftLeg,
  {
   startRotation: quat.fromEuler([], -30, 0, 0),
   endRotation: quat.fromEuler([], 30, 0, 0),
  },
  {
    startPosition: quat.fromEuler([], 0, 3, 15),
    endPosition: quat.fromEuler([], 0, 3, -15),
  },
  0,    // startTime
  1,  // duration
  true  // loop?
));
player.addChild(leftLeg);

const rightLeg = new Node();
rightLeg.addComponent(new Transform());
rightLeg.addComponent(
  new Model({
    primitives: [
      new Primitive({
        mesh: playerRightLeg.mesh,
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
rightLeg.addComponent(new WalkingAnimator(rightLeg,
  {
   startRotation: quat.fromEuler([], 30, 0, 0),
   endRotation: quat.fromEuler([], -30, 0, 0),
  },
  {
    startPosition: quat.fromEuler([], 0, 3, -15),
    endPosition: quat.fromEuler([], 0, 3, 15),
  },
  0,    // startTime
  1,  // duration
  true  // loop?
));
player.addChild(rightLeg);



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
player.addComponent(new PlayerMovement(player,player.getComponentOfType(PlayerControls), leftArm, leftLeg, rightLeg));
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

const levels = [
  { level1: 1, number: 4, healthfactor: 1, speedfactor: 1 },
  { level2: 2, number: 8, healthfactor: 1.25, speedfactor: 1.25 },
  { level3: 3, number: 12, healthfactor: 1.5, speedfactor: 1.5 },
  { level4: 4, number: 16, healthfactor: 2, speedfactor: 2 },
  { level5: 5, number: 20, healthfactor: 2.5, speedfactor: 2.5 },
];
let zombies = new Node();
let spawner = new EnemySpawner(zombies,zombieRes,player);
let levelindex = 0;
let n = 2;
let startWave = false;
export function initSound(){
  console.log("sound on");
  const bgmusic = document.getElementById("bgMusic");
  

  const player = new SoundManager();
  player.setVolume(0.2);
  player.play(bgmusic);
  bgmusic.loop = true;
}
export function inittLevel(index){
  levelindex = index - 1;
  console.log("index: " + index);
  console.log(levels[levelindex].number);
  if(levelindex < levels.length){
    spawner.spawn(levels[levelindex].number,levels[levelindex].healthfactor,levels[levelindex].speedfactor);
  }
  else {
    console.log("given level does not exsist");
  }
}
console.log(levelindex);
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
      child.destroy(scene);
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
  if(player.getComponentOfType(Health).isDead){
    console.log("player died game over");
    
    player.removeComponent(PlayerMovement);
    window.location.reload();
  }
  if(zombies.children.length == 0 && !startWave){
    startWave = true;
    setTimeout(() =>{
      n += 2; //increase zombie amount
      levelindex++;
      if(levelindex >= levels.length){
        console.log("game has been won");
      }
      else {
        spawner.spawn(n,levels[levelindex].healthfactor,levels[levelindex].speedfactor);
      }
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
function gamveOver(){
  physics = null;
  scene = null;
}
//const gui = new GUI();
//const controller = camera.getComponentOfType(FirstPersonController);
//gui.add(controller, "pointerSensitivity", 0.0001, 0.01);
//gui.add(controller, "maxSpeed", 0, 10);
//gui.add(controller, "decay", 0, 1);
//gui.add(controller, "acceleration", 1, 100);