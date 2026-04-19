import {
  renderer,
  scene,
  camera,
  updateCamera,
  ocean,
  showAIWorld,
  showExperienceWorld,
  showIntroCamera,
  showIntroWorld,
  showMapCamera,
  showProjectsWorld,
  startGameplayCameraTransition,
  isGameplayCameraTransitionDone
} from './game/scene';
import { player, mixer } from './game/player';
import { updateControls, setCanMove } from './game/controls';
import { checkZones, setActiveWorld, setGameHUDVisible, updateZoneAnimations } from './game/zones';
import type { GameWorldId } from './game/zones';
import { updateIntroWorld } from './game/introWorld';

// ================= INTRO =================
const intro = document.createElement("div");

intro.innerHTML = `
<h1 style="margin:0 0 8px;font-size:34px;">QA Jeimmy's Mind World 🎮</h1>
<p style="margin:0 0 14px;">Explore islands, collect treasures 💎 and complete missions</p>
<div style="display:grid;gap:8px;">
  <button id="experienceStartBtn">Experience Island</button>
  <button id="projectsStartBtn">Projects Island</button>
  <button id="aiStartBtn">AI Island</button>
</div>
`;

intro.style.cssText = `
position:absolute;
top:32px;
left:50%;
transform:translateX(-50%);
color:white;
z-index:1000;
text-align:center;
min-width:260px;
text-shadow:0 2px 8px rgba(0,0,0,0.8);
`;

document.body.appendChild(intro);

const worldMenuButton = document.createElement("button");
worldMenuButton.textContent = "World menu";
worldMenuButton.style.cssText = `
position:absolute;
top:42px;
left:10px;
z-index:1000;
display:none;
`;
document.body.appendChild(worldMenuButton);

let gameStarted = false;
let movementEnabled = false;
setGameHUDVisible(false);

function getStartPosition(world: GameWorldId) {
  if (world === "experience") return { x: 0, y: 1, z: 24 };
  if (world === "projects") return { x: 0, y: 1, z: 3 };

  return { x: 0, y: 1, z: -9 };
}

function startWorld(world: GameWorldId) {
  intro.style.display = "none";
  worldMenuButton.style.display = "block";
  gameStarted = true;
  movementEnabled = false;
  setCanMove(false);
  setGameHUDVisible(true);
  setActiveWorld(world);

  if (player) {
    const startPosition = getStartPosition(world);
    player.position.set(startPosition.x, startPosition.y, startPosition.z);
  }

  if (world === "experience") showExperienceWorld();
  if (world === "projects") showProjectsWorld();
  if (world === "ai") showAIWorld();

  showMapCamera();
  startGameplayCameraTransition();
}

document.getElementById("experienceStartBtn")!.onclick = () => startWorld("experience");
document.getElementById("projectsStartBtn")!.onclick = () => startWorld("projects");
document.getElementById("aiStartBtn")!.onclick = () => startWorld("ai");

["experienceStartBtn", "projectsStartBtn", "aiStartBtn"].forEach((buttonId) => {
  const button = document.getElementById(buttonId);
  if (!button) return;

  button.style.cssText = `
    border:1px solid rgba(255,255,255,0.65);
    background:rgba(86,35,150,0.52);
    color:white;
    padding:9px 14px;
    cursor:pointer;
    font-weight:bold;
    text-shadow:none;
    border-radius:6px;
  `;
});

worldMenuButton.onclick = () => {
  intro.style.display = "block";
  worldMenuButton.style.display = "none";
  gameStarted = false;
  movementEnabled = false;
  setCanMove(false);
  setGameHUDVisible(false);
  setActiveWorld(null);
  showIntroWorld();
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
