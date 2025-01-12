import { quat, vec3, mat4 } from 'glm';
import { Transform } from '../../engine/core/Transform.js';

export class WalkingAnimator {

    constructor(node, {
        startRotation = [0, 0, 0, 1],
        endRotation = [0, 0, 0, 1],
        } = {}, {
        startPosition = [0, 0, 0],
        endPosition = [0, 0, 0],
        } = {},
        startTime = 0,
        duration = 1,
        loop = false) {

        this.node = node;

        this.startRotation = startRotation;
        this.endRotation = endRotation;

        this.startPosition = startPosition;
        this.endPosition = endPosition;

        this.startTime = startTime;
        this.duration = duration;
        this.loop = loop;

        this.playing = true;
    }

    play() {
        this.playing = true;
    }

    pause() {
        this.playing = false;
    }

    reset() {
        this.pause();
        const transform = this.node.getComponentOfType(Transform);
        transform.rotation = [0, 0, 0, 1];
        transform.translation = [0, 0, 0];
    }

    update(t, dt) {
        if (!this.playing) {
            return;
        }
        
        const halfDuration = this.duration / 2;

        // phase 1 - one leg going forward, the other going backward
        // phase 2 - the other way around
        const phase = t % this.duration < (halfDuration)? 1 : 2;

        const linearInterpolation = (t - this.startTime) / halfDuration;
        const clampedInterpolation = Math.min(Math.max(linearInterpolation, 0), 1);
        const loopedInterpolation = ((linearInterpolation % 1) + 1) % 1;
        this.updateNode(this.loop ? loopedInterpolation : clampedInterpolation, phase);
    }

    updateNode(interpolation, phase) {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }
        
        if (phase === 1) {
            // rotating animation
            quat.slerp(transform.rotation, this.startRotation, this.endRotation, interpolation);
            // linear animation
            vec3.lerp(transform.translation, this.startPosition, this.endPosition, interpolation);
        }
        if (phase === 2) {
            // rotating animation
            quat.slerp(transform.rotation, this.endRotation, this.startRotation, interpolation);
            // linear animation
            vec3.lerp(transform.translation, this.endPosition, this.startPosition, interpolation);
        }
        
    }

}
