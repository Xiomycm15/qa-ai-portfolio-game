import { player } from './player';
import { playAnimation } from './player';

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
    left: keys['ArrowLeft'],
    right: keys['ArrowRight'],
  };
}

export function updateControls() {
  if (!canMove || !player) return;

  const s = 0.12;
  const intent = getIntent();

  let moving = false;

  if (intent.up) {
    player.position.z -= s;
    player.rotation.y = Math.PI;
    moving = true;
  }

  if (intent.down) {
    player.position.z += s;
    player.rotation.y = 0;
    moving = true;
  }

  if (intent.left) {
    player.position.x -= s;
    player.rotation.y = Math.PI / 2;
    moving = true;
  }

  if (intent.right) {
    player.position.x += s;
    player.rotation.y = -Math.PI / 2;
    moving = true;
  }

  playAnimation(moving ? "Walk" : "Idle");
}
