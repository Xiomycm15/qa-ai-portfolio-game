let panel: HTMLDivElement | null = null;
const mobilePanelQuery = window.matchMedia("(max-width: 768px)");
let mobilePanelExpanded = false;
let currentPanelTitle = "Mission";

export function getPanel() {
  if (!panel) {
    panel = document.createElement("div");

    panel.style.cssText = `
      position:fixed;
      background:black;
      color:white;
      padding:20px 48px 20px 20px;
      overflow:auto;
      display:none;
      z-index:999;
      box-sizing:border-box;
      border:1px solid white;
    `;
    applyPanelLayout(panel);

    document.body.appendChild(panel);
  }

  return panel;
}

function applyPanelLayout(p: HTMLDivElement) {
  if (mobilePanelQuery.matches) {
    p.style.top = "auto";
    p.style.right = "0";
    p.style.bottom = "0";
    p.style.left = "0";
    p.style.width = "100%";
    p.style.height = mobilePanelExpanded ? "min(70vh, 560px)" : "58px";
    p.style.maxHeight = mobilePanelExpanded ? "70vh" : "58px";
    p.style.transform = "none";
    p.style.borderRadius = "8px 8px 0 0";
    p.style.borderLeft = "1px solid white";
    p.style.borderRight = "1px solid white";
    p.style.overflow = mobilePanelExpanded ? "auto" : "hidden";
    return;
  }

  p.style.top = "0";
  p.style.right = "0";
  p.style.bottom = "0";
  p.style.left = "auto";
  p.style.width = "min(440px, 38vw)";
  p.style.height = "100vh";
  p.style.maxHeight = "100vh";
  p.style.transform = "none";
  p.style.borderRadius = "0";
  p.style.borderLeft = "1px solid white";
  p.style.borderRight = "0";
  p.style.overflow = "auto";
}

export function showPanel(content: string) {
  const p = getPanel();
  const wasVisible = p.style.display === "block";
  if (mobilePanelQuery.matches && !wasVisible) {
    mobilePanelExpanded = false;
  }

  currentPanelTitle = getPanelTitle(content);
  applyPanelLayout(p);
  p.innerHTML = `
    <button id="closePanel" aria-label="Close panel">&times;</button>
    <button id="toggleMobilePanel" type="button" aria-expanded="${mobilePanelExpanded}">
      ${getMobileToggleText()}
    </button>
    <div id="panelContent">
      ${content}
    </div>
  `;
  p.style.display = "block";
  updateMobilePanelState();

  const closeBtn = document.getElementById("closePanel");
  if (closeBtn) {
    closeBtn.style.cssText = `
      position:absolute;
      top:8px;
      right:8px;
      width:28px;
      height:28px;
      border:1px solid white;
      background:transparent;
      color:white;
      cursor:pointer;
      font-size:20px;
      line-height:20px;
    `;
    closeBtn.onclick = hidePanel;
  }

  const toggleBtn = document.getElementById("toggleMobilePanel");
  if (toggleBtn) {
    toggleBtn.style.cssText = `
      display:${mobilePanelQuery.matches ? "block" : "none"};
      position:absolute;
      top:10px;
      left:12px;
      border:1px solid white;
      background:transparent;
      color:white;
      cursor:pointer;
      padding:8px 10px;
      font-weight:bold;
    `;
    toggleBtn.onclick = () => {
      mobilePanelExpanded = !mobilePanelExpanded;
      applyPanelLayout(p);
      updateMobilePanelState();
    };
  }
}

export function hidePanel() {
  const p = getPanel();
  p.style.display = "none";
}

function getPanelTitle(content: string) {
  const titleMatch = content.match(/<h[23][^>]*>(.*?)<\/h[23]>/i);
  const title = titleMatch?.[1]
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return title || "Mission";
}

function getMobileToggleText() {
  return `${mobilePanelExpanded ? "Collapse" : "Open"}: ${currentPanelTitle}`;
}

function updateMobilePanelState() {
  const p = getPanel();
  const content = document.getElementById("panelContent");
  const toggleBtn = document.getElementById("toggleMobilePanel");

  if (content) {
    content.style.display = mobilePanelQuery.matches && !mobilePanelExpanded ? "none" : "block";
    content.style.paddingTop = mobilePanelQuery.matches ? "36px" : "0";
  }

  if (toggleBtn) {
    toggleBtn.textContent = getMobileToggleText();
    toggleBtn.setAttribute("aria-expanded", String(mobilePanelExpanded));
    toggleBtn.style.display = mobilePanelQuery.matches ? "block" : "none";
  }

  applyPanelLayout(p);
}

window.addEventListener("resize", () => {
  if (panel) updateMobilePanelState();
});
