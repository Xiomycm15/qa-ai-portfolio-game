import * as THREE from 'three';
import { aiWorld, experienceWorld, projectsWorld } from './scene';
import { player } from './player';
import { showPanel, hidePanel } from "../ui/panel";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { registerBoxCollider, registerCircleCollider, setActiveCollisionWorld } from './collisions';


// ======================
// 🎮 STATE
// ======================
let collected = new Set<string>();
let score = 0;
const total = 6;

type MissionId =
  | "aiBugAnalysis"
  | "aiTestPlan"
  | "experienceScotiabank"
  | "experienceCiandt"
  | "experienceGlobant"
  | "experienceTcs"
  | "experienceAndes";

const completedMissions = new Set<MissionId>();
const totalMissions = 7;

const missionChecklistItems: Array<{ id: MissionId; label: string }> = [
  { id: "aiBugAnalysis", label: "AI Bug Analysis" },
  { id: "aiTestPlan", label: "AI Test Plan" },
  { id: "experienceGlobant", label: "CI&T Production Investigation" },
  { id: "experienceCiandt", label: "Globant Automation Strategy" },
  { id: "experienceScotiabank", label: "Scotiabank Backend Validation" },
  { id: "experienceTcs", label: "Tata Consultancy Services Integration" },
  { id: "experienceAndes", label: "Universidad de los Andes Debugging" },
];

const treasureChecklistItems = [
  "Playwright",
  "Cypress",
  "AI",
  "Postman",
  "Pytest",
  "Experience",
];

let currentZone: string | null = null;
let finalMessageShown = false;

// Experience
type ExpStep = "intro" | "investigation" | "answer";

let expStep: ExpStep = "intro";

let attempts = 0;
const islandMixers: THREE.AnimationMixer[] = [];
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

type ExperienceLogoMission = "ciandt" | "globant" | "scotiabank" | "tcs" | "andes";
export type GameWorldId = "experience" | "projects" | "ai";

let activeWorld: GameWorldId | null = null;

const experienceLogoInteractionPoints: Array<{
  mission: ExperienceLogoMission;
  position: THREE.Vector3;
}> = [];

// ======================
// 🧾 SCORE UI
// ======================
const scoreUI = document.createElement("div");
scoreUI.style.cssText = `
position:absolute;
top:10px;
left:10px;
color:white;
font-weight:bold;
z-index:1000;
`;
document.body.appendChild(scoreUI);

const missionChecklistUI = document.createElement("div");
missionChecklistUI.style.cssText = `
position:absolute;
top:10px;
right:10px;
width:min(320px, calc(100vw - 32px));
color:white;
font-weight:bold;
z-index:1000;
box-sizing:border-box;
`;
document.body.appendChild(missionChecklistUI);

const treasureChecklistUI = document.createElement("div");
treasureChecklistUI.style.cssText = `
position:absolute;
top:58px;
right:10px;
width:min(320px, calc(100vw - 32px));
color:white;
font-weight:bold;
z-index:1000;
box-sizing:border-box;
`;
document.body.appendChild(treasureChecklistUI);

let missionChecklistOpen = false;
let treasureChecklistOpen = false;

export function setGameHUDVisible(visible: boolean) {
  const display = visible ? "block" : "none";

  scoreUI.style.display = display;
  missionChecklistUI.style.display = display;
  treasureChecklistUI.style.display = display;
}

export function setActiveWorld(world: GameWorldId | null) {
  activeWorld = world;
  setActiveCollisionWorld(world);
  currentZone = null;
  hidePanel();
}

function updateScoreUI() {
  scoreUI.innerText = `💎 ${collected.size}/${total} | 🚀 ${completedMissions.size}/${totalMissions} | ⭐ ${score}`;
  updateMissionChecklistUI();
  updateTreasureChecklistUI();
}

function updateTreasureChecklistPosition() {
  const gap = 8;
  const top = missionChecklistUI.offsetTop + missionChecklistUI.offsetHeight + gap;

  treasureChecklistUI.style.top = `${top}px`;
}

function updateMissionChecklistUI() {
  const items = missionChecklistItems.map((mission) => {
    const isCompleted = completedMissions.has(mission.id);

    return `
      <li style="display:flex;gap:8px;align-items:flex-start;margin:8px 0;line-height:1.25;">
        <span>${isCompleted ? "✅" : "⬜"}</span>
        <span>${mission.label}</span>
      </li>
    `;
  }).join("");

  missionChecklistUI.innerHTML = `
    <button
      id="missionChecklistToggle"
      type="button"
      aria-expanded="${missionChecklistOpen}"
      style="
        width:100%;
        border:1px solid white;
        background:black;
        color:white;
        padding:8px 10px;
        cursor:pointer;
        text-align:left;
        font-weight:bold;
        border-radius:6px;
      "
    >
      🚀 Mission Checklist ${missionChecklistOpen ? "▲" : "▼"} ${completedMissions.size}/${totalMissions}
    </button>

    <div
      id="missionChecklistContent"
      style="
        display:${missionChecklistOpen ? "block" : "none"};
        margin-top:6px;
        background:black;
        border:1px solid white;
        padding:10px;
        max-height:calc(100vh - 72px);
        overflow:auto;
        box-sizing:border-box;
        border-radius:6px;
      "
    >
      <ul style="list-style:none;margin:0;padding:0;font-size:13px;">
        ${items}
      </ul>
    </div>
  `;

  const toggle = document.getElementById("missionChecklistToggle");
  if (toggle) {
    toggle.onclick = () => {
      missionChecklistOpen = !missionChecklistOpen;
      updateMissionChecklistUI();
      updateTreasureChecklistUI();
    };
  }

  updateTreasureChecklistPosition();
}

function updateTreasureChecklistUI() {
  updateTreasureChecklistPosition();

  const items = treasureChecklistItems.map((treasure) => {
    const isCollected = collected.has(treasure);

    return `
      <li style="display:flex;gap:8px;align-items:flex-start;margin:8px 0;line-height:1.25;">
        <span>${isCollected ? "💎" : "⬜"}</span>
        <span>${treasure} Island</span>
      </li>
    `;
  }).join("");

  treasureChecklistUI.innerHTML = `
    <button
      id="treasureChecklistToggle"
      type="button"
      aria-expanded="${treasureChecklistOpen}"
      style="
        width:100%;
        border:1px solid white;
        background:black;
        color:white;
        padding:8px 10px;
        cursor:pointer;
        text-align:left;
        font-weight:bold;
        border-radius:6px;
      "
    >
      💎 Treasure Checklist ${treasureChecklistOpen ? "▲" : "▼"} ${collected.size}/${total}
    </button>

    <div
      id="treasureChecklistContent"
      style="
        display:${treasureChecklistOpen ? "block" : "none"};
        margin-top:6px;
        background:black;
        border:1px solid white;
        padding:10px;
        max-height:calc(100vh - 120px);
        overflow:auto;
        box-sizing:border-box;
        border-radius:6px;
      "
    >
      <ul style="list-style:none;margin:0;padding:0;font-size:13px;">
        ${items}
      </ul>
    </div>
  `;

  const toggle = document.getElementById("treasureChecklistToggle");
  if (toggle) {
    toggle.onclick = () => {
      treasureChecklistOpen = !treasureChecklistOpen;
      updateTreasureChecklistUI();
    };
  }
}

function completeMission(missionId: MissionId) {
  if (completedMissions.has(missionId)) return false;

  completedMissions.add(missionId);
  score += 2000;
  updateScoreUI();
  checkFinalProgress();

  return true;
}

updateScoreUI();

// ======================
// 🏆 FINAL
// ======================
function hasCollectedAllTreasures() {
  return collected.size === total;
}

function hasCompletedAllMissions() {
  return completedMissions.size === totalMissions;
}

function checkFinalProgress() {
  if (hasCollectedAllTreasures() && hasCompletedAllMissions()) {
    showFinalMessage();
  }
}

function showFinalMessage() {
  if (finalMessageShown || !hasCollectedAllTreasures() || !hasCompletedAllMissions()) {
    return;
  }

  finalMessageShown = true;

  const final = document.createElement("div");

  final.innerHTML = `
    <h3>🎉 Enhorabuena!</h3>
    <p>You explored all my QA skills</p>
    <p>🚀 Missions completed: ${completedMissions.size}/${totalMissions}</p>
    <p>⭐ Score: ${score}</p>
    <button id="restart">Restart</button>
  `;

  final.style.cssText = `
  position:absolute;
  bottom:20px;
  right:20px;
  background:black;
  color:white;
  padding:15px;
  z-index:1000;
  `;

  document.body.appendChild(final);

  document.getElementById("restart")!.onclick = () => {
    collected.clear();
    completedMissions.clear();
    score = 0;
    expStep = "intro";
    attempts = 0;
    finalMessageShown = false;

    if (player) player.position.set(0, 1, 0);

    updateScoreUI();
    final.remove();
  };
}

// ======================
// 🏝️ ISLAND
// ======================
function createModelIsland(
  modelPath: string,
  x: number,
  z: number,
  fallbackColor: number,
  targetSize = 6,
  parentWorld: THREE.Group,
  world: GameWorldId,
  titleModelPath?: string,
  registerLogoInteractions = false,
  rigidBodyRadius = 0
) {
  const group = new THREE.Group();
  group.position.set(x, 1, z);
  parentWorld.add(group);

  if (rigidBodyRadius > 0) {
    registerCircleCollider(group.position, rigidBodyRadius, world);
  }

  gltfLoader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
        islandMixers.push(mixer);
      }

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();

      box.getSize(size);
      box.getCenter(center);

      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
      model.scale.setScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = new THREE.Vector3();
      scaledBox.getCenter(scaledCenter);

      model.position.sub(scaledCenter);

      const centeredBox = new THREE.Box3().setFromObject(model);
      model.position.y += -0.5 - centeredBox.min.y;

      group.add(model);
      group.updateMatrixWorld(true);
      registerModelColliders(model, world);

      if (registerLogoInteractions) {
        registerExperienceLogoInteractionPoints(model);
      }

      if (titleModelPath) {
        const finalIslandBox = new THREE.Box3().setFromObject(model);
        loadIslandTitle(titleModelPath, group, targetSize * 0.44, finalIslandBox.max.y + 1);
      }
    },
    undefined,
    () => {
      const fallback = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 1, 32),
        new THREE.MeshStandardMaterial({ color: fallbackColor })
      );
      fallback.position.set(0, 0, 0);
      group.add(fallback);
    }
  );

  return group;
}

function loadIslandTitle(modelPath: string, parent: THREE.Group, targetSize: number, y: number) {
  gltfLoader.load(modelPath, (gltf) => {
    const title = gltf.scene;
    const box = new THREE.Box3().setFromObject(title);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
    title.scale.setScalar(scale);

    const scaledBox = new THREE.Box3().setFromObject(title);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    title.position.sub(scaledCenter);
    title.position.y += y;

    parent.add(title);
  });
}

function shouldRegisterCollider(name: string) {
  const lowerName = name.toLowerCase();
  const ignoredParts = ["floor", "grass", "water", "logo", "window", "highway", "sand"];

  return !ignoredParts.some((part) => lowerName.includes(part));
}

function registerModelColliders(model: THREE.Object3D, world: GameWorldId) {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !shouldRegisterCollider(child.name)) return;

    const box = new THREE.Box3().setFromObject(child);
    const size = new THREE.Vector3();
    box.getSize(size);

    if (size.x < 0.2 || size.z < 0.2) return;
    if (size.x > 2 || size.z > 2) return;

    registerBoxCollider(box, 0.05, world);
  });
}

function getLogoMission(name: string): ExperienceLogoMission | null {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("logo_ciandt")) return "ciandt";
  if (lowerName.includes("logo_globant")) return "globant";
  if (lowerName.includes("logo_scotiabank")) return "scotiabank";
  if (lowerName.includes("logo_tata")) return "tcs";
  if (lowerName.includes("logo_uniandes")) return "andes";

  return null;
}

function registerExperienceLogoInteractionPoints(model: THREE.Object3D) {
  experienceLogoInteractionPoints.length = 0;

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const mission = getLogoMission(child.name);
    if (!mission) return;

    const box = new THREE.Box3().setFromObject(child);
    const center = new THREE.Vector3();
    box.getCenter(center);

    experienceLogoInteractionPoints.push({ mission, position: center });
  });
}

export function updateZoneAnimations(delta: number) {
  islandMixers.forEach((mixer) => mixer.update(delta));
}

// ======================
// 🌍 ZONES
// ======================
const zones = [
  { mesh: createModelIsland("/playwright-island.glb", 12, -2, 0x3366ff, 7, projectsWorld, "projects", undefined, false, 2.55), title: "Playwright", world: "projects", interactionRadius: 3.4 },
  { mesh: createModelIsland("/cypress-island.glb", -12, -2, 0x00ff66, 7, projectsWorld, "projects", undefined, false, 2.55), title: "Cypress", world: "projects", interactionRadius: 3.4 },
  { mesh: createModelIsland("/AI-island.glb", 0, -14, 0xff3366, 7, aiWorld, "ai", undefined, false, 2.55), title: "AI", world: "ai", interactionRadius: 3.4 },
  { mesh: createModelIsland("/postman-island.glb", 15, 10, 0xffcc00, 7, projectsWorld, "projects", undefined, false, 2.55), title: "Postman", world: "projects", interactionRadius: 3.4 },
  { mesh: createModelIsland("/pytest-island.glb", -15, 10, 0x9933ff, 7, projectsWorld, "projects", undefined, false, 2.55), title: "Pytest", world: "projects", interactionRadius: 3.4 },
  { mesh: createModelIsland("/experience-island.glb", 0, 18, 0x00ffff, 13, experienceWorld, "experience", "/experience-island-title.glb", true), title: "Experience", world: "experience", interactionRadius: 2.4 }
];



// ======================
// 🎮 IA PANEL PRO
// ======================
function renderIAPanel() {
  showPanel(`
    <h2>🤖 AI QA Lab</h2>
    <p>Choose an AI mission.</p>

    <button id="bugMissionBtn">Mission 1: Analyze a bug</button>
    <br/><br/>
    <button id="testPlanMissionBtn">Mission 2: Create a test plan</button>
    <br/><br/>
    <button id="claudeMissionBtn" disabled>Mission 3: Automation with Claude - coming soon</button>
  `);

  const bugMissionBtn = document.getElementById("bugMissionBtn");
  const testPlanMissionBtn = document.getElementById("testPlanMissionBtn");

  if (bugMissionBtn) bugMissionBtn.onclick = () => renderAIBugMission();
  if (testPlanMissionBtn) testPlanMissionBtn.onclick = () => renderAITestPlanMission();
}

function renderAIResult(title: string, result: string, missionCompleted: boolean, backAction: () => void) {
  showPanel(`
    <h2>${title}</h2>
    <p>${missionCompleted ? "🚀 Mission completed! +2000 points" : "🚀 Mission already completed"}</p>
    <pre id="aiResult"></pre>
    <button id="tryAgainBtn">Try again</button>
    <button id="aiMenuBtn">AI mission menu</button>
  `);

  const resultEl = document.getElementById("aiResult");
  if (resultEl) {
    resultEl.textContent = result;
    resultEl.style.cssText = `
      white-space:pre-wrap;
      font-family:inherit;
    `;
  }

  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const aiMenuBtn = document.getElementById("aiMenuBtn");

  if (tryAgainBtn) tryAgainBtn.onclick = backAction;
  if (aiMenuBtn) aiMenuBtn.onclick = () => renderIAPanel();
}

function renderAIBugMission(message = "") {
  showPanel(`
    <h2>🐞 Bug Analysis Mission</h2>
    <p>Describe the bug and I will analyze it like a QA engineer.</p>
    ${message ? `<p>${message}</p>` : ""}
    <textarea
      id="bugInput"
      rows="5"
      placeholder="Example: Checkout fails with 500 error after clicking Pay"
      style="width:100%;box-sizing:border-box;"
    ></textarea>
    <br/><br/>
    <button id="analyzeBtn">Analyze bug</button>
    <button id="aiMenuBtn">AI mission menu</button>
  `);

  const btn = document.getElementById("analyzeBtn");
  const aiMenuBtn = document.getElementById("aiMenuBtn");

  if (aiMenuBtn) aiMenuBtn.onclick = () => renderIAPanel();

  if (btn) {
    btn.addEventListener("click", async () => {
      const input = document.getElementById("bugInput") as HTMLTextAreaElement | null;
      const bug = input?.value.trim();

      if (!bug) {
        renderAIBugMission("Please describe the bug before analyzing it.");
        return;
      }

      showPanel("<p>🤖 AI is analyzing...</p>");

      try {
        const result = await analyzeWithAI(bug);
        const missionCompleted = completeMission("aiBugAnalysis");

        renderAIResult("🧠 Bug Analysis Result", result, missionCompleted, () => renderAIBugMission());
      } catch {
        renderAIBugMission("AI analysis failed. Please check that the AI server is running.");
      }
    });
  }
}

function renderAITestPlanMission(message = "") {
  showPanel(`
    <h2>🧪 User Story Test Plan</h2>
    <p>Paste a user story and I will convert it into Given, When, Then scenarios.</p>
    ${message ? `<p>${message}</p>` : ""}
    <textarea
      id="userStoryInput"
      rows="6"
      placeholder="As a user, I want to reset my password so that I can recover access to my account."
      style="width:100%;box-sizing:border-box;"
    ></textarea>
    <br/><br/>
    <button id="generateTestPlanBtn">Generate test plan</button>
    <button id="aiMenuBtn">AI mission menu</button>
  `);

  const btn = document.getElementById("generateTestPlanBtn");
  const aiMenuBtn = document.getElementById("aiMenuBtn");

  if (aiMenuBtn) aiMenuBtn.onclick = () => renderIAPanel();

  if (btn) {
    btn.addEventListener("click", async () => {
      const input = document.getElementById("userStoryInput") as HTMLTextAreaElement | null;
      const userStory = input?.value.trim();

      if (!userStory) {
        renderAITestPlanMission("Please paste a user story before generating the test plan.");
        return;
      }

      showPanel("<p>🤖 AI is creating the test plan...</p>");

      try {
        const result = await generateTestPlanWithAI(userStory);
        const missionCompleted = completeMission("aiTestPlan");

        renderAIResult("🧪 Test Plan Result", result, missionCompleted, () => renderAITestPlanMission());
      } catch {
        renderAITestPlanMission("Test plan generation failed. Please check that the AI server is running.");
      }
    });
  }
}

// ======================
// 🎮 EXPERIENCE PANEL PRO
// ======================
function renderExperienceMenu(message = "") {
  showPanel(`
    <h2>💼 Experience Island</h2>

    <p>I am a QA Engineer with experience across production, consulting, enterprise delivery, and academic foundations.</p>
    ${message ? `<p>${message}</p>` : ""}

    <button id="scotiabankMissionBtn">Mission 1: CI&T</button>
    <br/><br/>
    <button id="ciandtMissionBtn">Mission 2: Globant</button>
    <br/><br/>
    <button id="globantMissionBtn">Mission 3: Scotiabank</button>
    <br/><br/>
    <button id="tcsMissionBtn">Mission 4: Tata Consultancy Services</button>
    <br/><br/>
    <button id="andesMissionBtn">Mission 5: Universidad de los Andes</button>
  `);

  const scotiabankMissionBtn = document.getElementById("scotiabankMissionBtn");
  const ciandtMissionBtn = document.getElementById("ciandtMissionBtn");
  const globantMissionBtn = document.getElementById("globantMissionBtn");
  const tcsMissionBtn = document.getElementById("tcsMissionBtn");
  const andesMissionBtn = document.getElementById("andesMissionBtn");

  if (scotiabankMissionBtn) {
    scotiabankMissionBtn.onclick = () => {
      expStep = "investigation";
      renderExperiencePanel();
    };
  }

  if (ciandtMissionBtn) {
    ciandtMissionBtn.onclick = () => renderCiandtMission();
  }

  if (globantMissionBtn) {
    globantMissionBtn.onclick = () => renderScotiabankMission();
  }

  if (tcsMissionBtn) {
    tcsMissionBtn.onclick = () => renderTcsMission();
  }

  if (andesMissionBtn) {
    andesMissionBtn.onclick = () => renderAndesMission();
  }
}

function returnToExperienceMenu(message = "") {
  expStep = "intro";
  renderExperienceMenu(message);
}

function renderAndesMission() {
  showPanel(`
    <h2>🎓 Universidad de los Andes Code Debugging</h2>

    <p>At Universidad de los Andes, I contributed as both a Front-End Developer and QA Engineer — building Angular features, writing unit tests, and performing white-box testing to validate application logic at code level.</p>

    <p>This mission simulates the debugging and code validation work I performed while developing and testing production features.</p>

    <p><strong>A dashboard widget should display the number of completed tasks.</strong></p>

    <p>Users report that the counter always shows all tasks as completed.</p>

    <p>Inspect the function and identify the bug.</p>

    <button id="showAndesDebugBtn">Show “Debug Console / IDE Panel”</button>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const debugBtn = document.getElementById("showAndesDebugBtn");
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (debugBtn) debugBtn.onclick = () => renderAndesDebugPanel();
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderAndesDebugPanel() {
  showPanel(`
    <h2>💻 Debug Console / IDE Panel</h2>

    <pre style="white-space:pre-wrap;font-family:monospace;border:1px solid white;padding:10px;background:#111;">countCompletedTasks(tasks: Task[]): number {
  let total = 0;

  tasks.forEach(task => {
    if (task.completed = true) {
      total++;
    }
  });

  return total;
}</pre>

    <p><strong>What is causing the bug?</strong></p>

    <button id="andesAnswerA">A. Assignment operator used instead of comparison</button>
    <br/><br/>
    <button id="andesAnswerB">B. Filter method does not support arrays</button>
    <br/><br/>
    <button id="andesAnswerC">C. Category parameter must be number</button>
    <br/><br/>
    <button id="andesAnswerD">D. filteredProjects must be async</button>
    <br/><br/>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const correctBtn = document.getElementById("andesAnswerA");
  const wrongBtns = [
    document.getElementById("andesAnswerB"),
    document.getElementById("andesAnswerC"),
    document.getElementById("andesAnswerD"),
  ];
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (correctBtn) correctBtn.onclick = () => renderAndesResult(true);
  wrongBtns.forEach((btn) => {
    if (btn) btn.onclick = () => renderAndesResult(false);
  });
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderAndesResult(isCorrect: boolean) {
  if (isCorrect) {
    const missionCompleted = completeMission("experienceAndes");

    showPanel(`
      <h2>Correct.</h2>

      <p>The condition uses the assignment operator (=) instead of a comparison operator, causing every task to be evaluated as completed.</p>

      <p>This reflects the white-box testing, unit testing, and code-level debugging I performed while developing Angular applications at Universidad de los Andes.</p>

      <p>${missionCompleted ? "🚀 Mission Completed. +2000 points" : "🚀 Mission already completed."}</p>

      <button id="reviewAndesCodeBtn">Review code</button>
      <button id="experienceMenuBtn">Mission menu</button>
    `);
  } else {
    showPanel(`
      <h2>Not Quite.</h2>

      <p>The issue is caused by using the assignment operator (=) inside the condition, which forces the value to true instead of comparing it.</p>

      <p>Code-level validation and white-box testing were key parts of my development and QA work at Universidad de los Andes.</p>

      <button id="reviewAndesCodeBtn">Try again</button>
      <button id="experienceMenuBtn">Mission menu</button>
    `);
  }

  const reviewBtn = document.getElementById("reviewAndesCodeBtn");
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (reviewBtn) reviewBtn.onclick = () => renderAndesDebugPanel();
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderScotiabankMission() {
  showPanel(`
    <h2>🏦 Scotiabank Backend Validation</h2>

    <p>At Scotiabank, I performed backend and database validation for enterprise systems, using SQL to verify data integrity across integrated platforms and ensure financial transactions were processed correctly.</p>

    <p>This mission simulates the type of backend investigation I conducted while testing complex transactional workflows.</p>

    <p><strong>A customer reports that their loan payment was successfully charged, but their outstanding balance did not decrease.</strong></p>

    <p>Investigate the transaction records and identify where the process failed.</p>

    <button id="accessSqlRecordsBtn">Access Records SQL</button>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const accessBtn = document.getElementById("accessSqlRecordsBtn");
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (accessBtn) accessBtn.onclick = () => renderScotiabankRecords();
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderScotiabankRecords() {
  showPanel(`
    <h2>🗄️ SQL Investigation Records</h2>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
      <div style="border:1px solid white;padding:10px;background:#111;">
        <h3>Table 1: Payment Processor Records</h3>
        <pre style="white-space:pre-wrap;font-family:inherit;">Payment ID | Customer | Amount | Status
TXN-2041   | U882     | $500   | SUCCESS</pre>
      </div>

      <div style="border:1px solid white;padding:10px;background:#111;">
        <h3>Table 2: Loan Account Records</h3>
        <pre style="white-space:pre-wrap;font-family:inherit;">Customer | Balance Before | Balance After
U882     | $13,000        | $13,000</pre>
      </div>

      <div style="border:1px solid white;padding:10px;background:#111;">
        <h3>Table 3: Loan Ledger Records</h3>
        <pre style="white-space:pre-wrap;font-family:inherit;">Transaction ID | Applied To Loan
TXN-2041       | FALSE</pre>
      </div>
    </div>

    <p><strong>Based on the backend records, what is the most likely root cause?</strong></p>

    <button id="scotiaAnswerA">A. Payment processed but not applied to loan ledger</button>
    <br/><br/>
    <button id="scotiaAnswerB">B. Frontend balance display bug</button>
    <br/><br/>
    <button id="scotiaAnswerC">C. Customer submitted duplicate payment</button>
    <br/><br/>
    <button id="scotiaAnswerD">D. Loan account inactive</button>
    <br/><br/>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const correctBtn = document.getElementById("scotiaAnswerA");
  const wrongBtns = [
    document.getElementById("scotiaAnswerB"),
    document.getElementById("scotiaAnswerC"),
    document.getElementById("scotiaAnswerD"),
  ];
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (correctBtn) correctBtn.onclick = () => renderScotiabankResult(true);
  wrongBtns.forEach((btn) => {
    if (btn) btn.onclick = () => renderScotiabankResult(false);
  });
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderScotiabankResult(isCorrect: boolean) {
  if (isCorrect) {
    const missionCompleted = completeMission("experienceScotiabank");

    showPanel(`
      <h2>Correct.</h2>

      <p>The payment processor completed the transaction successfully, but the loan ledger never applied the payment to the account.</p>

      <p>This mirrors the backend and integration validation work I performed at Scotiabank, where I used SQL and system reconciliation to identify inconsistencies across financial workflows.</p>

      <p>${missionCompleted ? "🚀 Mission Completed. +2000 points" : "🚀 Mission already completed."}</p>

      <button id="retryScotiabankBtn">Review records</button>
      <button id="experienceMenuBtn">Mission menu</button>
    `);
  } else {
    showPanel(`
      <h2>Not quite.</h2>

      <p>The payment itself succeeded, but the balance remained unchanged because the transaction was never applied to the loan ledger.</p>

      <p>Backend reconciliation and SQL validation were key parts of my testing process when verifying financial system integrations at Scotiabank.</p>

      <button id="retryScotiabankBtn">Try again</button>
      <button id="experienceMenuBtn">Mission menu</button>
    `);
  }

  const retryBtn = document.getElementById("retryScotiabankBtn");
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (retryBtn) retryBtn.onclick = () => renderScotiabankRecords();
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderTcsMission() {
  showPanel(`
    <h2>🏢 Tata Consultancy Services Integration Mission</h2>

    <p>At Tata Consultancy Services, I validated end-to-end banking integrations across Oracle FLEXCUBE and connected enterprise systems, ensuring financial workflows processed accurately between platforms.</p>

    <p>This mission simulates the integration testing and business flow validation I performed on complex banking systems.</p>

    <p><strong>A customer initiates an international transfer through the banking portal.</strong></p>

    <p>The transfer request is created successfully, but the funds are never disbursed to the receiving bank.</p>

    <p>Trace the transaction across integrated systems and identify where the workflow failed.</p>

    <button id="showTcsPipelineBtn">Show System Flow Pipeline</button>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const pipelineBtn = document.getElementById("showTcsPipelineBtn");
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (pipelineBtn) pipelineBtn.onclick = () => renderTcsPipeline();
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderTcsPipeline() {
  const nodeInfo: Record<string, string> = {
    customerPortal: "Customer Portal\nStatus: SUCCESS\nRequest submitted successfully.",
    flexcube: "FLEXCUBE\nStatus: SUCCESS\nTransaction booked to core banking.",
    paymentProcessor: "Payment Processor\nStatus: SUCCESS\nPayment instruction generated.",
    settlementEngine: "Settlement Engine\nStatus: FAILED\nSettlement confirmation timeout.",
    receivingBank: "Receiving Bank\nStatus: NOT REACHED",
  };

  showPanel(`
    <h2>🔁 System Flow Pipeline</h2>

    <div style="display:grid;grid-template-columns:1fr;gap:8px;max-width:360px;">
      <button id="customerPortalNode" type="button">Customer Portal</button>
      <div style="text-align:center;">↓</div>
      <button id="flexcubeNode" type="button">FLEXCUBE Core Banking</button>
      <div style="text-align:center;">↓</div>
      <button id="paymentProcessorNode" type="button">Payment Processor</button>
      <div style="text-align:center;">↓</div>
      <button id="settlementEngineNode" type="button">Settlement Engine</button>
      <div style="text-align:center;">↓</div>
      <button id="receivingBankNode" type="button">Receiving Bank</button>
    </div>

    <pre id="tcsNodeInfo" style="white-space:pre-wrap;font-family:inherit;border:1px solid white;padding:10px;background:#111;">Hover over a pipeline node to inspect system status.</pre>

    <p><strong>Where did the integration fail?</strong></p>

    <button id="tcsAnswerA">a. FLEXCUBE Core Banking</button>
    <br/><br/>
    <button id="tcsAnswerB">b. Payment Processor</button>
    <br/><br/>
    <button id="tcsAnswerC">c. Settlement Engine</button>
    <br/><br/>
    <button id="tcsAnswerD">d. Receiving Bank</button>
    <br/><br/>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const bindNodeHover = (nodeId: string, infoKey: string) => {
    const node = document.getElementById(nodeId);
    const info = document.getElementById("tcsNodeInfo");

    if (node && info) {
      node.onmouseenter = () => {
        info.textContent = nodeInfo[infoKey];
      };
      node.onfocus = () => {
        info.textContent = nodeInfo[infoKey];
      };
    }
  };

  bindNodeHover("customerPortalNode", "customerPortal");
  bindNodeHover("flexcubeNode", "flexcube");
  bindNodeHover("paymentProcessorNode", "paymentProcessor");
  bindNodeHover("settlementEngineNode", "settlementEngine");
  bindNodeHover("receivingBankNode", "receivingBank");

  const correctBtn = document.getElementById("tcsAnswerC");
  const wrongBtns = [
    document.getElementById("tcsAnswerA"),
    document.getElementById("tcsAnswerB"),
    document.getElementById("tcsAnswerD"),
  ];
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (correctBtn) correctBtn.onclick = () => renderTcsResult(true);
  wrongBtns.forEach((btn) => {
    if (btn) btn.onclick = () => renderTcsResult(false);
  });
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderTcsResult(isCorrect: boolean) {
  if (isCorrect) {
    const missionCompleted = completeMission("experienceTcs");

    showPanel(`
      <h2>Correct.</h2>

      <p>The transfer successfully passed through the banking portal, FLEXCUBE, and payment processor, but failed at the settlement engine before reaching the receiving bank.</p>

      <p>This reflects the integration and end-to-end workflow validation I performed while testing complex banking platforms at Tata Consultancy Services.</p>

      <p>${missionCompleted ? "🚀 Mission Completed! +2000 points" : "🚀 Mission already completed."}</p>

      <button id="reviewTcsPipelineBtn">Review pipeline</button>
      <button id="experienceMenuBtn">Mission menu</button>
    `);
  } else {
    showPanel(`
      <h2>Trace Analysis Incomplete.</h2>

      <p>System logs show the transaction cleared upstream systems successfully and failed before reaching final settlement.</p>

      <p><strong>Root Cause Location:</strong> Settlement Engine</p>

      <p>This mirrors the integration tracing and workflow validation I performed while testing enterprise banking systems at Tata Consultancy Services.</p>

      <button id="reviewTcsPipelineBtn">Try again</button>
      <button id="experienceMenuBtn">Mission menu</button>
    `);
  }

  const reviewBtn = document.getElementById("reviewTcsPipelineBtn");
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (reviewBtn) reviewBtn.onclick = () => renderTcsPipeline();
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderCiandtMission(message = "") {
  const selectedScenarios = new Set<number>();
  const correctScenarios = new Set([1, 2, 3]);

  const scenarios = [
    {
      id: 1,
      title: "Checkout Saved Card Flow",
      businessImpact: "Critical",
      regressionRisk: "High",
      automationEffort: "Medium",
    },
    {
      id: 2,
      title: "Payment API Validation",
      businessImpact: "Critical",
      regressionRisk: "High",
      automationEffort: "Low",
    },
    {
      id: 3,
      title: "Login Cross-Browser Validation",
      businessImpact: "High",
      regressionRisk: "Medium",
      automationEffort: "Low",
    },
    {
      id: 4,
      title: "Profile Avatar Upload",
      businessImpact: "Low",
      regressionRisk: "Low",
      automationEffort: "Medium",
    },
    {
      id: 5,
      title: "FAQ Search Function",
      businessImpact: "Low",
      regressionRisk: "Low",
      automationEffort: "Low",
    },
    {
      id: 6,
      title: "Promotional Banner Animation",
      businessImpact: "Low",
      regressionRisk: "Low",
      automationEffort: "High",
    },
  ];

  showPanel(`
    <h2>🧩 Globant Automation Strategy</h2>

    <p>At Globant, I designed and maintained automation coverage for high-impact releases across enterprise products.</p>

    <p>Automation is not about testing everything — it is about prioritizing the right coverage based on business impact, regression risk, and engineering effort.</p>

    <p>This mission simulates how I approached automation strategy in real-world projects.</p>

    <p><strong>You have limited sprint capacity.</strong></p>
    <p>Choose the THREE test scenarios that should be automated before release.</p>
    ${message ? `<p>${message}</p>` : ""}

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
      ${scenarios.map((scenario) => `
        <button
          id="scenario${scenario.id}"
          type="button"
          data-scenario-id="${scenario.id}"
          style="text-align:left;white-space:normal;"
        >
          <strong>Card ${scenario.id}: ${scenario.title}</strong><br/>
          Business Impact: ${scenario.businessImpact}<br/>
          Regression Risk: ${scenario.regressionRisk}<br/>
          Automation Effort: ${scenario.automationEffort}
        </button>
      `).join("")}
    </div>

    <p id="selectionCount">Selected: 0/3</p>
    <button id="submitCiandtMissionBtn" disabled>Submit strategy</button>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const submitBtn = document.getElementById("submitCiandtMissionBtn") as HTMLButtonElement | null;

  const updateSelectionUI = () => {
    const count = document.getElementById("selectionCount");
    if (count) count.textContent = `Selected: ${selectedScenarios.size}/3`;
    if (submitBtn) submitBtn.disabled = selectedScenarios.size !== 3;

    scenarios.forEach((scenario) => {
      const card = document.getElementById(`scenario${scenario.id}`) as HTMLButtonElement | null;
      if (!card) return;

      card.style.border = selectedScenarios.has(scenario.id) ? "2px solid #00ff66" : "";
      card.style.background = selectedScenarios.has(scenario.id) ? "#12331f" : "";
    });
  };

  scenarios.forEach((scenario) => {
    const card = document.getElementById(`scenario${scenario.id}`);
    if (!card) return;

    card.onclick = () => {
      if (selectedScenarios.has(scenario.id)) {
        selectedScenarios.delete(scenario.id);
      } else if (selectedScenarios.size < 3) {
        selectedScenarios.add(scenario.id);
      }

      updateSelectionUI();
    };
  });

  const menuBtn = document.getElementById("experienceMenuBtn");

  if (submitBtn) {
    submitBtn.onclick = () => {
      if (selectedScenarios.size !== 3) {
        renderCiandtMission("Please choose exactly three scenarios before submitting.");
        return;
      }

      const correctCount = [...selectedScenarios].filter((id) => correctScenarios.has(id)).length;
      renderCiandtMissionResult(correctCount);
    };
  }

  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderCiandtMissionResult(correctCount: number) {
  const isPerfectStrategy = correctCount === 3;
  const missionCompleted = isPerfectStrategy ? completeMission("experienceCiandt") : false;

  let title = "Automation Budget Misallocated.";
  let content = `
    <p>Low-value tests consumed sprint capacity while critical business flows remained unprotected.</p>
    <p>A strong automation strategy prioritizes risk and business impact over breadth.</p>
  `;

  if (isPerfectStrategy) {
    title = "Excellent Prioritization.";
    content = `
      <p>You selected the highest-value automation candidates by focusing on critical business flows and regression-prone areas.</p>
      <p>This reflects the same risk-based automation strategy I applied while building automation coverage at Globant.</p>
      <p>${missionCompleted ? "🚀 Mission Completed! +2000 points" : "🚀 You already completed this mission."}</p>
    `;
  } else if (correctCount > 0) {
    title = "Good Strategy.";
    content = `
      <p>Automation prioritization is about balancing business impact, regression risk, and implementation effort.</p>
      <p>In real projects at Globant, I focused first on protecting critical paths and high-risk integrations.</p>
    `;
  }

  showPanel(`
    <h2>${title}</h2>
    ${content}
    <button id="tryCiandtAgainBtn">Try again</button>
    <button id="experienceMenuBtn">Mission menu</button>
  `);

  const tryAgainBtn = document.getElementById("tryCiandtAgainBtn");
  const menuBtn = document.getElementById("experienceMenuBtn");

  if (tryAgainBtn) tryAgainBtn.onclick = () => renderCiandtMission();
  if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
}

function renderExperiencePanel() {
  if (expStep === "intro") {
    renderExperienceMenu();
    return;
  }

  if (expStep === "investigation") {
    showPanel(`
      <h2>🚨 CI&T Production Investigation</h2>

      <p>During my time at CI&T, I supported live production environments by investigating real-time application issues affecting users in production.</p>

      <p>Leveraging tools like Splunk and Dynatrace, I analyzed logs, monitored performance metrics, traced root causes, and escalated incidents for resolution.</p>

      <p>This mission recreates the type of high-pressure production investigations I performed while supporting critical enterprise systems.</p>

      <p><strong>Scenario:</strong> Users cannot complete checkout.</p>

      <button id="logs">📊 Analyze system logs</button>
      <button id="api">🌐 Validate backend API</button>
      <button id="auto">🧪 Execute automated tests</button>
      <button id="db">🗄️ Validate database data</button>

      <br/><br/>
      <button id="answer">Submit root cause</button>
      <button id="experienceMenuBtn">Mission menu</button>
    `);

    const showInvestigationDetail = (content: string) => {
      showPanel(`
        ${content}
        <button id="back">⬅ Back</button>
        <button id="experienceMenuBtn">Mission menu</button>
      `);

      const backBtn = document.getElementById("back");
      const menuBtn = document.getElementById("experienceMenuBtn");
      if (backBtn) backBtn.onclick = () => renderExperiencePanel();
      if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
    };

    const logsBtn = document.getElementById("logs");
    const apiBtn = document.getElementById("api");
    const autoBtn = document.getElementById("auto");
    const dbBtn = document.getElementById("db");
    const answerBtn = document.getElementById("answer");
    const menuBtn = document.getElementById("experienceMenuBtn");

    if (logsBtn) {
      logsBtn.onclick = () => showInvestigationDetail(`
        <h3>📊 Logs Analysis</h3>
        <p>Error: Payment timeout</p>
        <p>💼 I use monitoring tools to detect production issues.</p>
      `);
    }

    if (apiBtn) {
      apiBtn.onclick = () => showInvestigationDetail(`
        <h3>🌐 API Validation</h3>
        <p>Status: 500</p>
        <p>💼 I validate backend services using Postman.</p>
      `);
    }

    if (autoBtn) {
      autoBtn.onclick = () => showInvestigationDetail(`
        <h3>🧪 Automation</h3>
        <p>Test failed</p>
        <p>💼 I build automation with Cypress & Playwright.</p>
      `);
    }

    if (dbBtn) {
      dbBtn.onclick = () => showInvestigationDetail(`
        <h3>🗄️ Database</h3>
        <p>Failed transactions</p>
        <p>💼 I use SQL to validate data.</p>
      `);
    }

    if (answerBtn) {
      answerBtn.onclick = () => {
        expStep = "answer";
        renderExperiencePanel();
      };
    }

    if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();

    return;
  }

  if (expStep === "answer") {
    showPanel(`
      <h2>🧠 Root Cause</h2>

      <p>What is causing the issue?</p>

      <button id="ui">UI issue</button>
      <button id="apiCorrect">API failure</button>
      <button id="dbWrong">Database</button>
      <br/><br/>
      <button id="experienceMenuBtn">Mission menu</button>
    `);

    const showWrongAnswer = () => {
      attempts++;

      let hint = "";

      if (attempts === 1) {
        hint = "💡 Hint: The issue is not in the UI layer.";
      } else if (attempts === 2) {
        hint = "💡 Hint: Check the API response status.";
      } else {
        hint = "✔ The correct answer is API failure.";
      }

      showPanel(`
        <h2>❌ Not quite right</h2>
        <p>${hint}</p>
        <button id="retry">Try again</button>
        <button id="experienceMenuBtn">Mission menu</button>
      `);

      const retryBtn = document.getElementById("retry");
      const menuBtn = document.getElementById("experienceMenuBtn");
      if (retryBtn) {
        retryBtn.onclick = () => {
          expStep = "answer";
          renderExperiencePanel();
        };
      }
      if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
    };

    const uiBtn = document.getElementById("ui");
    const dbWrongBtn = document.getElementById("dbWrong");
    const apiCorrectBtn = document.getElementById("apiCorrect");
    const menuBtn = document.getElementById("experienceMenuBtn");

    if (uiBtn) uiBtn.onclick = showWrongAnswer;
    if (dbWrongBtn) dbWrongBtn.onclick = showWrongAnswer;
    if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();

    if (apiCorrectBtn) {
      apiCorrectBtn.onclick = () => {
        const missionCompleted = completeMission("experienceGlobant");

        showPanel(`
          <h2>✔ Correct! API Failure</h2>
          <p>${missionCompleted ? "🚀 Mission completed! +2000 points" : "🚀 Mission already completed"}</p>

          <p><strong>Why this is correct:</strong></p>
          <ul>
            <li>API returned 500 error → backend failure</li>
            <li>Logs show payment timeout</li>
            <li>Database errors are consequences</li>
            <li>Automation only detects issues</li>
          </ul>

          <p><strong>QA Reasoning:</strong><br/>
          We analyze signals across layers to find root cause.</p>

          <p>💼 <strong>My strengths:</strong></p>
          <ul>
            <li>Analytical thinking</li>
            <li>API testing</li>
            <li>Production debugging</li>
          </ul>

          <button id="restart">Restart Mission</button>
          <button id="experienceMenuBtn">Mission menu</button>
        `);

        const restartBtn = document.getElementById("restart");
        const menuBtn = document.getElementById("experienceMenuBtn");
        if (restartBtn) {
          restartBtn.onclick = () => {
            expStep = "intro";
            attempts = 0;
            renderExperiencePanel();
          };
        }
        if (menuBtn) menuBtn.onclick = () => returnToExperienceMenu();
      };
    }
  }
}

  
// ======================
// 🎯 MAIN
// ======================
export function checkZones() {
  if (!player || !activeWorld) return;

  let foundZone: string | null = null;
  let foundExperienceMission: ExperienceLogoMission | null = null;

  for (const z of zones) {
    if (z.world !== activeWorld) continue;

    if (z.title === "Experience") {
      foundExperienceMission = getNearbyExperienceLogoMission(player.position);

      if (foundExperienceMission) {
        foundZone = `Experience:${foundExperienceMission}`;
        break;
      }
    } else if (isPlayerInsideZone(z)) {
      foundZone = z.title;
      break;
    }
  }

  // 🧠 Si no hay zona → limpiar estado
  if (!foundZone) {
    hidePanel();
    currentZone = null;
    return;
  }

  // 🛑 Si sigue en la misma zona → no repetir lógica
  if (currentZone === foundZone) return;

  // 🔥 CAMBIO DE ZONA
  currentZone = foundZone;

  // 🎯 SCORE
  const collectedZone = foundZone.startsWith("Experience:") ? "Experience" : foundZone;

  if (!collected.has(collectedZone)) {
    collected.add(collectedZone);
    score += 1000;
    updateScoreUI();

    checkFinalProgress();
  }

  // 🎮 EXPERIENCE
if (foundExperienceMission) {
  renderExperienceLogoMission(foundExperienceMission);
  return;
}

if (foundZone === "AI") {
  renderIAPanel();
  return;
}

  // 🏝️ ZONA NORMAL
showPanel(`<h2>${foundZone}</h2>`);
}

function distanceOnGround(a: THREE.Vector3, b: THREE.Vector3) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;

  return Math.sqrt(dx * dx + dz * dz);
}

function isPlayerInsideZone(zone: typeof zones[number]) {
  const interactionRadius = zone.interactionRadius ?? 2;

  if (zone.title !== "Experience") {
    return distanceOnGround(player!.position, zone.mesh.position) < interactionRadius;
  }

  return Boolean(getNearbyExperienceLogoMission(player!.position));
}

function getNearbyExperienceLogoMission(position: THREE.Vector3): ExperienceLogoMission | null {
  const nearbyLogo = experienceLogoInteractionPoints.find((logo) => (
    distanceOnGround(position, logo.position) < getExperienceLogoInteractionRadius(logo.mission)
  ));

  return nearbyLogo?.mission ?? null;
}

function getExperienceLogoInteractionRadius(mission: ExperienceLogoMission) {
  if (mission === "andes") return 4.8;

  return 2;
}

function renderExperienceLogoMission(mission: ExperienceLogoMission) {
  if (mission === "ciandt") {
    expStep = "investigation";
    renderExperiencePanel();
    return;
  }

  if (mission === "globant") {
    renderCiandtMission();
    return;
  }

  if (mission === "scotiabank") {
    renderScotiabankMission();
    return;
  }

  if (mission === "tcs") {
    renderTcsMission();
    return;
  }

  renderAndesMission();
}

  // 🏝️ AI FUNCTION 
type AIResponse = {
  result: string;
};

async function analyzeWithAI(bug: string): Promise<string> {
  const res = await fetch("http://localhost:3000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bug }),
  });

  const data: AIResponse = await res.json();
  return data.result;
}

async function generateTestPlanWithAI(userStory: string): Promise<string> {
  const res = await fetch("http://localhost:3000/test-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userStory }),
  });

  const data: AIResponse = await res.json();
  return data.result;
}
