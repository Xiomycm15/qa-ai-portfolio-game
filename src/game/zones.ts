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

let currentZone: string | null = null;

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
// 🎮 IA PANEL PRO
// ======================
function renderIAPanel() {
  showPanel(`
    <h2>🤖 AI Debug Assistant</h2>
    <button id="analyzeBtn">Analyze</button>
  `);

  const btn = document.getElementById("analyzeBtn");

  if (btn) {
    btn.addEventListener("click", async () => {
      showPanel("<p>🤖 AI is analyzing...</p>");

const result = await analyzeWithAI(
  "TypeError: Cannot read properties of undefined"
);

showPanel(`
  <h2>🧠 AI Result</h2>
  <p>${result}</p>
`);
    });
  }
}

// ======================
// 🎮 EXPERIENCE PANEL PRO
// ======================
function renderExperiencePanel() {

  // INTRO
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

    const btn = document.getElementById("start");

    if (btn) {
      btn.onclick = () => {
        expStep = "investigation";
        renderExperiencePanel();
      };
    }
  }
}

  // INVESTIGATION
  if (expStep === "investigation"as ExpStep) {

  showPanel(`
    <h2>🚨 Production Incident</h2>

    <p><strong>Scenario:</strong> Users cannot complete checkout.</p>

    <p>This is a real-world QA situation where I investigate multiple system layers.</p>

    <button id="logs">📊 Analyze system logs</button>
    <button id="api">🌐 Validate backend API</button>
    <button id="auto">🧪 Execute automated tests</button>
    <button id="db">🗄️ Validate database data</button>

    <br/><br/>
    <button id="answer">Submit root cause</button>
  `);

  const logsBtn = document.getElementById("logs");
  const apiBtn = document.getElementById("api");
  const autoBtn = document.getElementById("auto");
  const dbBtn = document.getElementById("db");
  const answerBtn = document.getElementById("answer");

  if (logsBtn) {
    logsBtn.onclick = () => {
      showPanel("<p>📊 Logs show payment service timeout...</p>");
    };
  }

  if (apiBtn) {
    apiBtn.onclick = () => {
      showPanel("<p>🌐 API response: 500 Internal Server Error</p>");
    };
  }

  if (autoBtn) {
    autoBtn.onclick = () => {
      showPanel("<p>🧪 Automated tests failing on checkout flow</p>");
    };
  }

  if (dbBtn) {
    dbBtn.onclick = () => {
      showPanel("<p>🗄️ Database connection stable, no issues found</p>");
    };
  }

  if (answerBtn) {
    answerBtn.onclick = () => {
      expStep = "answer";
      renderExperiencePanel();
    };
  }
}

    // LOGS
const logsBtn = document.getElementById("logs");

if (logsBtn) {
  logsBtn.onclick = () => {
    showPanel(`
      <h3>📊 Logs Analysis</h3>
      <p>Error: Payment timeout</p>
      <p>💼 I use monitoring tools to detect production issues.</p>
      <button id="back">⬅ Back</button>
    `);

    const backBtn = document.getElementById("back");

    if (backBtn) {
      backBtn.onclick = () => renderExperiencePanel();
    }
  };
}

    // API
   const apiBtn = document.getElementById("api");

if (apiBtn) {
  apiBtn.onclick = () => {
    showPanel(`
      <h3>🌐 API Validation</h3>
      <p>Status: 500</p>
      <p>💼 I validate backend services using Postman.</p>
      <button id="back">⬅ Back</button>
    `);

    const backBtn = document.getElementById("back");

    if (backBtn) {
      backBtn.onclick = () => renderExperiencePanel();
    }
  };
}

    // AUTO
const autoBtn = document.getElementById("auto");

if (autoBtn) {
  autoBtn.onclick = () => {
    showPanel(`
      <h3>🧪 Automation</h3>
      <p>Test failed</p>
      <p>💼 I build automation with Cypress & Playwright.</p>
      <button id="back">⬅ Back</button>
    `);

    const backBtn = document.getElementById("back");

    if (backBtn) {
      backBtn.onclick = () => renderExperiencePanel();
    }
  };
}

    // DB
const dbBtn = document.getElementById("db");
const answerBtn = document.getElementById("answer");

if (dbBtn) {
  dbBtn.onclick = () => {
    showPanel(`
      <h3>🗄️ Database</h3>
      <p>Failed transactions</p>
      <p>💼 I use SQL to validate data.</p>
      <button id="back">⬅ Back</button>
    `);

    const backBtn = document.getElementById("back");
    if (backBtn) backBtn.onclick = () => renderExperiencePanel();
  };
}

if (answerBtn) {
  answerBtn.onclick = () => {
    expStep = "answer";
    renderExperiencePanel();
  };
}

// ANSWER
else if (expStep === "answer" as ExpStep) {
  showPanel(`
    <h2>🧠 Root Cause</h2>

    <p>What is causing the issue?</p>

    <button id="ui">UI issue</button>
    <button id="apiCorrect">API failure</button>
    <button id="dbWrong">Database</button>
  `);

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

  // CORRECT ANSWER + REASONING
  if (apiCorrectBtn) {
    apiCorrectBtn.onclick = () => {
      showPanel(`
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