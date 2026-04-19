import * as THREE from 'three';

type BoxCollider = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

type CircleCollider = {
  x: number;
  z: number;
  radius: number;
};

const boxColliders: BoxCollider[] = [];
const circleColliders: CircleCollider[] = [];

export function registerBoxCollider(box: THREE.Box3, padding = 0.2) {
  boxColliders.push({
    minX: box.min.x - padding,
    maxX: box.max.x + padding,
    minZ: box.min.z - padding,
    maxZ: box.max.z + padding,
  });
}

export function registerCircleCollider(center: THREE.Vector3, radius: number) {
  circleColliders.push({
    x: center.x,
    z: center.z,
    radius,
  });
}

export function collidesWithWorldObstacles(position: THREE.Vector3, radius = 0.35) {
  const collidesWithBox = boxColliders.some((box) => {
    const closestX = THREE.MathUtils.clamp(position.x, box.minX, box.maxX);
    const closestZ = THREE.MathUtils.clamp(position.z, box.minZ, box.maxZ);
    const dx = position.x - closestX;
    const dz = position.z - closestZ;

    return dx * dx + dz * dz < radius * radius;
  });

  if (collidesWithBox) return true;

  return circleColliders.some((circle) => {
    const dx = position.x - circle.x;
    const dz = position.z - circle.z;
    const minDistance = circle.radius + radius;

    return dx * dx + dz * dz < minDistance * minDistance;
  });
}
