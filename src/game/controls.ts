import { player } from './player';
import { playAnimation, stopAnimation } from './player';
import { collidesWithWorldObstacles } from './collisions';

const keys: Record<string, boolean> = {};
let canMove = false;

export const setCanMove = (v: boolean) => canMove = v;

window.addEventListener('keydown', e => {
  keys[e.key] = true;
});

window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// 🧠 Nueva capa: intención
function getIntent() {
  return {
    up: keys['ArrowUp'],
    down: keys['ArrowDown'],
    left: keys['ArrowRight'],
    right: keys['ArrowLeft'],
  };
}

export function updateControls() {
  if (!canMove || !player) return;

  const s = 0.12;
  const intent = getIntent();

  let moving = false;

  function tryMove(dx: number, dz: number) {
    const nextPosition = player!.position.clone();
    nextPosition.x += dx;
    nextPosition.z += dz;

    if (collidesWithWorldObstacles(nextPosition)) return false;

    player!.position.copy(nextPosition);
    return true;
  }

  if (intent.up) {
    player.rotation.y = Math.PI;
    moving = tryMove(0, -s) || moving;
  }

  if (intent.down) {
    player.rotation.y = 0;
    moving = tryMove(0, s) || moving;
  }

  if (intent.left) {
    player.rotation.y = Math.PI / 2;
    moving = tryMove(s, 0) || moving;
  }

  if (intent.right) {
    player.rotation.y = -Math.PI / 2;
    moving = tryMove(-s, 0) || moving;
  }

  if (moving) {
    playAnimation("Running");
  } else {
    stopAnimation();
  }
}
