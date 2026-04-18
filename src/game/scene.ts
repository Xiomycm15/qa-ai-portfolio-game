import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050d1a);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,6,10);

export const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.style.cursor = "grab";
document.body.appendChild(renderer.domElement);

let cameraYaw = 0;
let cameraPitch = 0.46;
let cameraDistance = 9.4;
let isDraggingCamera = false;
let lastPointerX = 0;
let lastPointerY = 0;
const cameraLookAtHeightOffset = 2.1;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

renderer.domElement.addEventListener("pointerdown", (event) => {
  isDraggingCamera = true;
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
  renderer.domElement.style.cursor = "grabbing";
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!isDraggingCamera) return;

  const deltaX = event.clientX - lastPointerX;
  const deltaY = event.clientY - lastPointerY;

  cameraYaw -= deltaX * 0.005;
  cameraPitch = clamp(cameraPitch - deltaY * 0.003, 0.18, 1.1);

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
});

renderer.domElement.addEventListener("pointerup", (event) => {
  isDraggingCamera = false;
  renderer.domElement.releasePointerCapture(event.pointerId);
  renderer.domElement.style.cursor = "grab";
});

renderer.domElement.addEventListener("wheel", (event) => {
  event.preventDefault();
  cameraDistance = clamp(cameraDistance + event.deltaY * 0.01, 6, 18);
}, { passive: false });

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// luces
const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(5,10,5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff,0.5));

// océano
export const ocean = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200),
  new THREE.MeshStandardMaterial({color:0x0f3057, roughness:0.3, metalness:0.8})
);
ocean.rotation.x = -Math.PI/2;
scene.add(ocean);

// cielo
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(100,32,32),
  new THREE.MeshBasicMaterial({color:0x050d1a, side:THREE.BackSide})
));

// estrellas
const geo = new THREE.BufferGeometry();
const pos = [];
for(let i=0;i<1000;i++){
  pos.push((Math.random()-0.5)*200, Math.random()*100, (Math.random()-0.5)*200);
}
geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:0.5})));

// core
export function updateCamera(p:THREE.Vector3){
  const horizontalDistance = Math.cos(cameraPitch) * cameraDistance;
  const target = p.clone();
  const lookAtTarget = p.clone();
  lookAtTarget.y += cameraLookAtHeightOffset;

  camera.position.x = target.x + Math.sin(cameraYaw) * horizontalDistance;
  camera.position.y = target.y + Math.sin(cameraPitch) * cameraDistance;
  camera.position.z = target.z + Math.cos(cameraYaw) * horizontalDistance;
  camera.lookAt(lookAtTarget);
}
