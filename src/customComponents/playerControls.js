import { quat, vec2, vec3, mat4, vec4 } from "glm";
import { Transform } from "../../engine/core/Transform.js";
import { Camera } from "../../engine/core/Camera.js";

export class PlayerControls {
  canvas = document.querySelector("canvas");

  constructor(domElement, camera, playerObj = null) {
    this.domElement = domElement;
    this.camera = camera.getComponentOfType(Camera);
    this.cameraTransform = camera.getComponentOfType(Transform);
    this.keys = {};
    this.playerObj = playerObj;
    this.initHandlers();
  }

  initHandlers() {
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.mousePosHandeler = this.mousePosHandeler.bind(this);

    const element = this.domElement;
    const doc = element.ownerDocument;

    doc.addEventListener("keydown", this.keydownHandler);
    doc.addEventListener("keyup", this.keyupHandler);
    doc.addEventListener("mousemove", this.mousePosHandeler);
  }
  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }
  mousePosHandeler(e) {
    const mousePos = [e.clientX, e.clientY];
    const angle = this.getMouseAngle(mousePos);

    const playerTrans = this.playerObj.getComponentOfType(Transform);
    const up = vec3.fromValues(0, 1, 0);
    quat.setAxisAngle(playerTrans.rotation, up, -(angle+Math.PI/2));

    //this.testObj.getComponentOfType(Transform).setRotation(0,angle,0,1);
  }

  getMouseAngle(mousePos) {
    const normalizedX = (mousePos[0] / this.canvas.width) * 2 - 1;
    const normalizedY = 1 - (mousePos[1] / this.canvas.height) * 2;

    const projectionMatrix = this.camera.projectionMatrix;
    const inversePVMatrix = mat4.create();
    mat4.multiply(
      inversePVMatrix,
      projectionMatrix,
      this.cameraTransform.matrix
    );
    mat4.invert(inversePVMatrix, inversePVMatrix);

    const clipSpacePosition = vec4.fromValues(
      normalizedX,
      normalizedY,
      -1.0,
      1.0
    );

    const worldSpacePosition = vec4.create();
    vec4.transformMat4(worldSpacePosition, clipSpacePosition, inversePVMatrix);

    if (worldSpacePosition[3] !== 0) {
      worldSpacePosition[0] /= worldSpacePosition[3];
      worldSpacePosition[1] /= worldSpacePosition[3];
      worldSpacePosition[2] /= worldSpacePosition[3];
    }

    const out = [worldSpacePosition[0], 0, -worldSpacePosition[1]];

    const dir = vec2.fromValues(out[0], out[2]);
    vec2.normalize(dir, dir);

    const angle = Math.atan2(dir[1], dir[0]);
    return angle;
  }
}
