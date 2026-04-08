let panel: HTMLDivElement | null = null;

export function getPanel() {
  if (!panel) {
    panel = document.createElement("div");

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
  }

  return panel;
}

export function showPanel(content: string) {
  const p = getPanel();
  p.innerHTML = content;
  p.style.display = "block";
}

export function hidePanel() {
  const p = getPanel();
  p.style.display = "none";
}