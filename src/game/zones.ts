import * as THREE from 'three';
import { scene } from './scene';
import { player } from './player';
import { showPanel, hidePanel } from "../ui/panel";


// ======================
// 🎮 STATE
// ======================
let collected = new Set<string>();
let score = 0;
const total = 6;

type MissionId = "aiBugAnalysis" | "aiTestPlan" | "experienceRootCause";

const completedMissions = new Set<MissionId>();
const totalMissions = 3;

let currentZone: string | null = null;
let finalMessageShown = false;

// Experience
type ExpStep = "intro" | "investigation" | "answer";

let expStep: ExpStep = "intro";

let attempts = 0;

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



function updateScoreUI() {
  scoreUI.innerText = `💎 ${collected.size}/${total} | 🚀 ${completedMissions.size}/${totalMissions} | ⭐ ${score}`;
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
function createIsland(color: number, x: number, z: number) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 1, 32),
    new THREE.MeshStandardMaterial({ color })
  );
  m.position.set(x, 1, z);
  scene.add(m);
  return m;
}

// ======================
// 🌍 ZONES
// ======================
const zones = [
  { mesh: createIsland(0x3366ff, 6, 0), title: "Playwright" },
  { mesh: createIsland(0x00ff66, -6, 0), title: "Cypress" },
  { mesh: createIsland(0xff3366, 0, -6), title: "AI" },
  { mesh: createIsland(0xffcc00, 8, 5), title: "Postman" },
  { mesh: createIsland(0x9933ff, -8, 5), title: "Pytest" },
  { mesh: createIsland(0x00ffff, 0, 8), title: "Experience" }
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
function renderExperiencePanel() {
  if (expStep === "intro") {
    showPanel(`
      <h2>💼 Experience Island</h2>

      <p>I am a QA Engineer with experience working in real production environments.</p>

      <ul>
        <li>Scotiabank → Banking systems & production validation</li>
        <li>CI&T → Automation testing & QA processes</li>
      </ul>

      <p>🎯 In this mission, you will experience how I investigate and solve real production issues.</p>

      <button id="start">Start Mission 🚀</button>
    `);

    const startBtn = document.getElementById("start");

    if (startBtn) {
      startBtn.onclick = () => {
        expStep = "investigation";
        renderExperiencePanel();
      };
    }

    return;
  }

  if (expStep === "investigation") {
    showPanel(`
      <h2>🚨 Production Incident</h2>

      <p><strong>Scenario:</strong> Users cannot complete checkout.</p>

      <button id="logs">📊 Analyze system logs</button>
      <button id="api">🌐 Validate backend API</button>
      <button id="auto">🧪 Execute automated tests</button>
      <button id="db">🗄️ Validate database data</button>

      <br/><br/>
      <button id="answer">Submit root cause</button>
    `);

    const showInvestigationDetail = (content: string) => {
      showPanel(`
        ${content}
        <button id="back">⬅ Back</button>
      `);

      const backBtn = document.getElementById("back");
      if (backBtn) backBtn.onclick = () => renderExperiencePanel();
    };

    const logsBtn = document.getElementById("logs");
    const apiBtn = document.getElementById("api");
    const autoBtn = document.getElementById("auto");
    const dbBtn = document.getElementById("db");
    const answerBtn = document.getElementById("answer");

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

    return;
  }

  if (expStep === "answer") {
    showPanel(`
      <h2>🧠 Root Cause</h2>

      <p>What is causing the issue?</p>

      <button id="ui">UI issue</button>
      <button id="apiCorrect">API failure</button>
      <button id="dbWrong">Database</button>
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
      `);

      const retryBtn = document.getElementById("retry");
      if (retryBtn) {
        retryBtn.onclick = () => {
          expStep = "answer";
          renderExperiencePanel();
        };
      }
    };

    const uiBtn = document.getElementById("ui");
    const dbWrongBtn = document.getElementById("dbWrong");
    const apiCorrectBtn = document.getElementById("apiCorrect");

    if (uiBtn) uiBtn.onclick = showWrongAnswer;
    if (dbWrongBtn) dbWrongBtn.onclick = showWrongAnswer;

    if (apiCorrectBtn) {
      apiCorrectBtn.onclick = () => {
        const missionCompleted = completeMission("experienceRootCause");

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
        `);

        const restartBtn = document.getElementById("restart");
        if (restartBtn) {
          restartBtn.onclick = () => {
            expStep = "intro";
            attempts = 0;
            renderExperiencePanel();
          };
        }
      };
    }
  }
}

  
// ======================
// 🎯 MAIN
// ======================
export function checkZones() {
  if (!player) return;

  let foundZone: string | null = null;

  for (const z of zones) {
    const distance = player.position.distanceTo(z.mesh.position);

    if (distance < 2) {
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
  if (!collected.has(foundZone)) {
    collected.add(foundZone);
    score += 1000;
    updateScoreUI();

    checkFinalProgress();
  }

  // 🎮 EXPERIENCE
if (foundZone === "Experience") {
  renderExperiencePanel();
  return;
}

if (foundZone === "AI") {
  renderIAPanel();
  return;
}

  // 🏝️ ZONA NORMAL
showPanel(`<h2>${foundZone}</h2>`);
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
