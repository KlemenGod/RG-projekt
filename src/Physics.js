import { vec3, mat4 } from "glm";
import { getGlobalModelMatrix } from "engine/core/SceneUtils.js";
import { Transform } from "engine/core.js";
import { Bullet } from "./customComponents/Bullet.js";
import { Health } from "./customComponents/Health.js";
export class Physics {
  constructor(scene) {
    this.scene = scene;
  }

  update(t, dt) {
    this.scene.traverse((node) => {
      if (node.isDynamic) {
        this.scene.traverse((other) => {
          if (node !== other && (other.isStatic || other.isDynamic)) {
            const nodeBox = this.getTransformedAABB(node);
            const otherBox = this.getTransformedAABB(other);
            const isColliding = this.aabbIntersection(nodeBox, otherBox);
            if(other.isBullet && node.isEnemy && isColliding){
              console.log("hit enemy");
              const bullet = other.getComponentOfType(Bullet);
              bullet.onHit(5,node.getComponentOfType(Health));
              
              other.destroy(this.scene);
            }
            else if(node.isBullet && other.isStatic && isColliding){
              console.log("hit wall");
              node.destroy(this.scene);
            }

            else{
              this.resolveCollision(node, other);
            }
          }
        });
      }
    });
  }

  intervalIntersection(min1, max1, min2, max2) {
    return !(min1 > max2 || min2 > max1);
  }

  aabbIntersection(aabb1, aabb2) {
    return (
      this.intervalIntersection(
        aabb1.min[0],
        aabb1.max[0],
        aabb2.min[0],
        aabb2.max[0]
      ) &&
      this.intervalIntersection(
        aabb1.min[1],
        aabb1.max[1],
        aabb2.min[1],
        aabb2.max[1]
      ) &&
      this.intervalIntersection(
        aabb1.min[2],
        aabb1.max[2],
        aabb2.min[2],
        aabb2.max[2]
      )
    );
  }

  getTransformedAABB(node) {
    // Transform all vertices of the AABB from local to global space.
    const matrix = getGlobalModelMatrix(node);
    const { min, max } = node.aabb;
    const vertices = [
      [min[0], min[1], min[2]],
      [min[0], min[1], max[2]],
      [min[0], max[1], min[2]],
      [min[0], max[1], max[2]],
      [max[0], min[1], min[2]],
      [max[0], min[1], max[2]],
      [max[0], max[1], min[2]],
      [max[0], max[1], max[2]],
    ].map((v) => vec3.transformMat4(v, v, matrix));

    // Find new min and max by component.
    const xs = vertices.map((v) => v[0]);
    const ys = vertices.map((v) => v[1]);
    const zs = vertices.map((v) => v[2]);
    const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
    const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
    return { min: newmin, max: newmax };
  }

  resolveCollision(a, b) {
    // Get global space AABBs.
    const aBox = this.getTransformedAABB(a);
    const bBox = this.getTransformedAABB(b);

    // Check if there is collision.
    const isColliding = this.aabbIntersection(aBox, bBox);
    if (!isColliding) {
      return;
    }

    // Move node A minimally to avoid collision.
    const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
    const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

    let minDiff = Infinity;
    let minDirection = [0, 0, 0];
    if (diffa[0] >= 0 && diffa[0] < minDiff) {
      minDiff = diffa[0];
      minDirection = [minDiff, 0, 0];
    }
    if (diffa[1] >= 0 && diffa[1] < minDiff) {
      minDiff = diffa[1];
      minDirection = [0, minDiff, 0];
    }
    if (diffa[2] >= 0 && diffa[2] < minDiff) {
      minDiff = diffa[2];
      minDirection = [0, 0, minDiff];
    }
    if (diffb[0] >= 0 && diffb[0] < minDiff) {
      minDiff = diffb[0];
      minDirection = [-minDiff, 0, 0];
    }
    if (diffb[1] >= 0 && diffb[1] < minDiff) {
      minDiff = diffb[1];
      minDirection = [0, -minDiff, 0];
    }
    if (diffb[2] >= 0 && diffb[2] < minDiff) {
      minDiff = diffb[2];
      minDirection = [0, 0, -minDiff];
    }

    const transform = a.getComponentOfType(Transform);
    if (!transform) {
      return;
    }

    vec3.add(transform.translation, transform.translation, minDirection);
  }
  PointCollision(point, wall) {
    const wallBox = this.getTransformedAABB(wall); 
    return (
        point[0] >= wallBox.min[0] &&
        point[0] <= wallBox.max[0] &&
        point[1] >= wallBox.min[1] &&
        point[1] <= wallBox.max[1] &&
        point[2] >= wallBox.min[2] &&
        point[2] <= wallBox.max[2]
    );
}
}
