import * as THREE from 'three';

type BoxCollider = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

const boxColliders: BoxCollider[] = [];

export function registerBoxCollider(box: THREE.Box3, padding = 0.2) {
  boxColliders.push({
    minX: box.min.x - padding,
    maxX: box.max.x + padding,
    minZ: box.min.z - padding,
    maxZ: box.max.z + padding,
  });
}

export function collidesWithWorldObstacles(position: THREE.Vector3, radius = 0.35) {
  return boxColliders.some((box) => {
    const closestX = THREE.MathUtils.clamp(position.x, box.minX, box.maxX);
    const closestZ = THREE.MathUtils.clamp(position.z, box.minZ, box.maxZ);
    const dx = position.x - closestX;
    const dz = position.z - closestZ;

    return dx * dx + dz * dz < radius * radius;
  });
}
