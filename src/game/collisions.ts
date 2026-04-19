import * as THREE from 'three';

type CollisionWorld = "experience" | "projects" | "ai";

type BoxCollider = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  world?: CollisionWorld;
};

type CircleCollider = {
  x: number;
  z: number;
  radius: number;
  world?: CollisionWorld;
};

const boxColliders: BoxCollider[] = [];
const circleColliders: CircleCollider[] = [];
let activeCollisionWorld: CollisionWorld | null = null;

export function setActiveCollisionWorld(world: CollisionWorld | null) {
  activeCollisionWorld = world;
}

function belongsToActiveWorld(colliderWorld?: CollisionWorld) {
  return !colliderWorld || colliderWorld === activeCollisionWorld;
}

export function registerBoxCollider(box: THREE.Box3, padding = 0.2, world?: CollisionWorld) {
  boxColliders.push({
    minX: box.min.x - padding,
    maxX: box.max.x + padding,
    minZ: box.min.z - padding,
    maxZ: box.max.z + padding,
    world,
  });
}

export function registerCircleCollider(center: THREE.Vector3, radius: number, world?: CollisionWorld) {
  circleColliders.push({
    x: center.x,
    z: center.z,
    radius,
    world,
  });
}

export function collidesWithWorldObstacles(position: THREE.Vector3, radius = 0.35) {
  const collidesWithBox = boxColliders.some((box) => {
    if (!belongsToActiveWorld(box.world)) return false;

    const closestX = THREE.MathUtils.clamp(position.x, box.minX, box.maxX);
    const closestZ = THREE.MathUtils.clamp(position.z, box.minZ, box.maxZ);
    const dx = position.x - closestX;
    const dz = position.z - closestZ;

    return dx * dx + dz * dz < radius * radius;
  });

  if (collidesWithBox) return true;

  return circleColliders.some((circle) => {
    if (!belongsToActiveWorld(circle.world)) return false;

    const dx = position.x - circle.x;
    const dz = position.z - circle.z;
    const minDistance = circle.radius + radius;

    return dx * dx + dz * dz < minDistance * minDistance;
  });
}
