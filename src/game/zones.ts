import * as THREE from 'three';
import { scene } from './scene';
import { player } from './player';

// ======================
// 🎮 STATE
// ======================
let collected = new Set<string>();
let score = 0;
const total = 6;

let currentZone: string | null = null;

// Experience
let expStep: "intro" | "investigation" | "answer" = "intro";
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


function hidePanel() {
  panel.style.display = "none";
}

function updateScoreUI() {
  scoreUI.innerText = `💎 ${collected.size}/${total} | ⭐ ${score}`;
}

// ======================
// 🏆 FINAL
// ======================
function showFinalMessage() {
  const final = document.createElement("div");

  final.innerHTML = `
    <h3>🎉 Enhorabuena!</h3>
    <p>You explored all my QA skills</p>
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
    score = 0;
    expStep = "intro";
    attempts = 0;

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
// 🖥️ PANEL
// ======================
const panel = document.createElement("div");
panel.style.cssText = `
position:absolute;
top:50%;
left:50%;
transform:translate(-50%,-50%);
background:black;
color:white;
padding:20px;
width:380px;
display:none;
z-index:999;
`;
document.body.appendChild(panel);


// ======================
// 🎮 IA PANEL PRO
// ======================

function renderIAPanel() {
  if (!panel) return;

  const p = panel;

  p.style.display = "block";

  p.innerHTML = `
    <h2>🤖 AI Debug Assistant</h2>
    <button id="analyzeBtn">Analyze</button>
  `;

  const btn = document.getElementById("analyzeBtn");

  if (btn) {
    btn.addEventListener("click", async () => {
      p.innerHTML = "<p>🤖 AI is analyzing...</p>";

      const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bug: "TypeError: Cannot read properties of undefined"
        })
      });

      const data = await res.json();

      p.innerHTML = `
        <h2>🧠 AI Result</h2>
        <p>${data.result}</p>
      `;
    });
  }
}

// ======================
// 🎮 EXPERIENCE PANEL PRO
// ======================
function renderExperiencePanel() {

  // INTRO
  if (expStep === "intro") {
    panel.innerHTML = `
      <h2>💼 Experience Island</h2>

      <p>I am a QA Engineer with experience working in real production environments.</p>

      <ul>
        <li>Scotiabank → Banking systems & production validation</li>
        <li>CI&T → Automation testing & QA processes</li>
      </ul>

      <p>🎯 In this mission, you will experience how I investigate and solve real production issues.</p>

      <button id="start">Start Mission 🚀</button>
    `;

    document.getElementById("start")!.onclick = () => {
      expStep = "investigation";
      renderExperiencePanel();
    };
  }

  // INVESTIGATION
  else if (expStep === "investigation") {
    panel.innerHTML = `
      <h2>🚨 Production Incident</h2>

      <p><strong>Scenario:</strong> Users cannot complete checkout.</p>

      <p>This is a real-world QA situation where I investigate multiple system layers.</p>

      <button id="logs">📊 Analyze system logs</button>
      <button id="api">🌐 Validate backend API</button>
      <button id="auto">🧪 Execute automated tests</button>
      <button id="db">🗄️ Validate database data</button>

      <br/><br/>
      <button id="answer">Submit root cause</button>
    `;

    // LOGS
    document.getElementById("logs")!.onclick = () => {
      panel.innerHTML = `
        <h3>📊 Logs Analysis</h3>
        <p>Error: Payment timeout</p>
        <p>💼 I use monitoring tools to detect production issues.</p>
        <button id="back">⬅ Back</button>
      `;
      document.getElementById("back")!.onclick = () => renderExperiencePanel();
    };

    // API
    document.getElementById("api")!.onclick = () => {
      panel.innerHTML = `
        <h3>🌐 API Validation</h3>
        <p>Status: 500</p>
        <p>💼 I validate backend services using Postman.</p>
        <button id="back">⬅ Back</button>
      `;
      document.getElementById("back")!.onclick = () => renderExperiencePanel();
    };

    // AUTO
    document.getElementById("auto")!.onclick = () => {
      panel.innerHTML = `
        <h3>🧪 Automation</h3>
        <p>Test failed</p>
        <p>💼 I build automation with Cypress & Playwright.</p>
        <button id="back">⬅ Back</button>
      `;
      document.getElementById("back")!.onclick = () => renderExperiencePanel();
    };

    // DB
    document.getElementById("db")!.onclick = () => {
      panel.innerHTML = `
        <h3>🗄️ Database</h3>
        <p>Failed transactions</p>
        <p>💼 I use SQL to validate data.</p>
        <button id="back">⬅ Back</button>
      `;
      document.getElementById("back")!.onclick = () => renderExperiencePanel();
    };

    document.getElementById("answer")!.onclick = () => {
      expStep = "answer";
      renderExperiencePanel();
    };
  }

  // ANSWER
  else if (expStep === "answer") {
    panel.innerHTML = `
      <h2>🧠 Root Cause</h2>

      <p>What is causing the issue?</p>

      <button id="ui">UI issue</button>
      <button id="apiCorrect">API failure</button>
      <button id="dbWrong">Database</button>
    `;

    // WRONG ANSWERS (HINTS)
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

      panel.innerHTML = `
        <h2>❌ Not quite right</h2>
        <p>${hint}</p>
        <button id="retry">Try again</button>
      `;

      document.getElementById("retry")!.onclick = () => {
        expStep = "answer";
        renderExperiencePanel();
      };
    };

    document.getElementById("ui")!.onclick = showWrongAnswer;
    document.getElementById("dbWrong")!.onclick = showWrongAnswer;

    // CORRECT ANSWER + REASONING
    document.getElementById("apiCorrect")!.onclick = () => {
      panel.innerHTML = `
        <h2>✔ Correct! API Failure</h2>

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
      `;

      document.getElementById("restart")!.onclick = () => {
        expStep = "intro";
        attempts = 0;
        renderExperiencePanel();
      };
    };
  }
}

// ======================
// 🎯 MAIN
// ======================
export function checkZones() {
  if (!player) return;

  let foundZone: string | null = null;
  let activeZone = null;

  for (const z of zones) {
    const distance = player.position.distanceTo(z.mesh.position);

    if (distance < 2) {
      foundZone = z.title;
      activeZone = z;
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

    if (collected.size === total) showFinalMessage();
  }

  // 🎮 EXPERIENCE
  if (foundZone === "Experience") {
    renderExperiencePanel();
    panel.style.display = "block";
    return;
  }

    if (foundZone === "AI") {
    renderIAPanel();
    panel.style.display = "block";
    return;
  }

  // 🏝️ ZONA NORMAL
  panel.innerHTML = `<h2>${foundZone}</h2>`;
  panel.style.display = "block";
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