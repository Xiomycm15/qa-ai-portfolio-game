import {
  renderer,
  scene,
  camera,
  updateCamera,
  ocean,
  showMapCamera,
  startGameplayCameraTransition,
  isGameplayCameraTransitionDone
} from './game/scene';
import { player, mixer } from './game/player';
import { updateControls, setCanMove } from './game/controls';
import { checkZones, updateZoneAnimations } from './game/zones';

// ================= INTRO =================
const intro = document.createElement("div");

intro.innerHTML = `
<h1>QA Mind World 🎮</h1>
<p>Explore islands and collect treasures 💎</p>
<button id="startBtn">Start</button>
`;

intro.style.cssText = `
position:absolute;
top:50%;
left:50%;
transform:translate(-50%,-50%);
background:black;
color:white;
padding:20px;
z-index:1000;
`;

document.body.appendChild(intro);

let gameStarted = false;
let movementEnabled = false;

document.getElementById("startBtn")!.onclick = () => {
  intro.style.display = "none";
  gameStarted = true;
  movementEnabled = false;
  setCanMove(false);
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
      showMapCamera();
    }
  }

  // animación avatar e islas
  if (mixer) mixer.update(0.016);
  updateZoneAnimations(0.016);

  checkZones();

  // 🌊 evitar crash si ocean no existe
  if (ocean) {
    ocean.rotation.z += 0.0005;
  }

  renderer.render(scene, camera);
}

animate();
