import { vec3, vec4 } from "glm";

export class CameraFollow {
  constructor(player, transform, { offset = [0, 0, 0], lookAngle = 0 } = {}) {
    this.player = player;
    this.transform = transform;
    this.lookAngle = lookAngle;
    this.offset = vec3.fromValues(...offset);

    this.start();
  }

  start() {
    this.transform.rotation[0] = -this.lookAngle;
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
    this.transform.translation[0] = this.player.translation[0] + this.offset[0];
    this.transform.translation[1] = this.player.translation[1] + this.offset[1];
    this.transform.translation[2] = this.player.translation[2] + this.offset[2];
  }
}
