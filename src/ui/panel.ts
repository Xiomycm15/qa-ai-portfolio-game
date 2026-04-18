let panel: HTMLDivElement | null = null;

export function getPanel() {
  if (!panel) {
    panel = document.createElement("div");

    panel.style.cssText = `
      position:absolute;
      top:24px;
      left:50%;
      transform:translateX(-50%);
      background:black;
      color:white;
      padding:20px 48px 20px 20px;
      width:min(720px, calc(100vw - 32px));
      max-height:calc(100vh - 48px);
      overflow:auto;
      display:none;
      z-index:999;
      box-sizing:border-box;
    `;

    document.body.appendChild(panel);
  }

  return panel;
}

export function showPanel(content: string) {
  const p = getPanel();
  p.innerHTML = `
    <button id="closePanel" aria-label="Close panel">&times;</button>
    ${content}
  `;
  p.style.display = "block";

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
}

export function hidePanel() {
  const p = getPanel();
  p.style.display = "none";
}
