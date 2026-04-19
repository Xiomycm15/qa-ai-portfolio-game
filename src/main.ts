import {
  renderer,
  scene,
  camera,
  updateCamera,
  ocean,
  showGameWorld,
  showIntroCamera,
  showMapCamera,
  startGameplayCameraTransition,
  isGameplayCameraTransitionDone
} from './game/scene';
import { player, mixer } from './game/player';
import { updateControls, setCanMove } from './game/controls';
import { checkZones, setGameHUDVisible, updateZoneAnimations } from './game/zones';
import { updateIntroWorld } from './game/introWorld';

// ================= INTRO =================
const intro = document.createElement("div");

intro.innerHTML = `
<h1>QA Mind World 🎮</h1>
<p>Explore islands and collect treasures 💎</p>
<button id="startBtn">Start</button>
`;

intro.style.cssText = `
position:absolute;
top:32px;
left:50%;
transform:translateX(-50%);
background:black;
color:white;
padding:20px;
z-index:1000;
text-align:center;
`;

document.body.appendChild(intro);

let gameStarted = false;
let movementEnabled = false;
setGameHUDVisible(false);

document.getElementById("startBtn")!.onclick = () => {
  intro.style.display = "none";
  gameStarted = true;
  movementEnabled = false;
  setCanMove(false);
  setGameHUDVisible(true);
  showGameWorld();
  showMapCamera();
  startGameplayCameraTransition();
};

// ================= LOOP =================
function animate() {
  requestAnimationFrame(animate);

  // 🔥 evitar errores si player aún no carga
  if (player) {
    if (gameStarted) {
      updateControls();
      updateCamera(player.position);

      if (!movementEnabled && isGameplayCameraTransitionDone()) {
        movementEnabled = true;
        setCanMove(true);
      }
    } else {
      showIntroCamera();
    }
  }

  // animación avatar e islas
  if (mixer) mixer.update(0.016);
  updateIntroWorld(0.016);
  updateZoneAnimations(0.016);

  if (gameStarted) {
    checkZones();
  }

  // 🌊 evitar crash si ocean no existe
  if (ocean) {
    ocean.rotation.z += 0.0005;
  }

  renderer.render(scene, camera);
}

animate();
