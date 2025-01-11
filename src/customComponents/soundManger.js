import { vec3, vec4, quat } from "glm";
import { Transform } from "../../engine/core/Transform.js";

export class SoundManager {
  constructor() {
    this.volume = 1;
  }
  play(sound){
    sound.volume = this.volume;
    sound.play();
    
  }
  pause(sound){
    sound.pause();
  }
  init(level){
    const sounds = document.querySelectorAll("audio");
    sounds.foreach( (sound) => sound.volume = level);
  }
  setVolume(volume){
    this.volume = volume;
  }
  getVolume(){
    return this.volume;
  }


}
