import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050d1a);

export const introWorld = new THREE.Group();
export const gameWorld = new THREE.Group();
scene.add(introWorld);
scene.add(gameWorld);
gameWorld.visible = false;

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
let cameraDistance = 3.6;
let isDraggingCamera = false;
let lastPointerX = 0;
let lastPointerY = 0;
const cameraLookAtHeightOffset = 2.1;
const introCameraPosition = new THREE.Vector3(0, 5.8, 9);
const introCameraTarget = new THREE.Vector3(0, 2.2, 0);
const mapCameraPosition = new THREE.Vector3(0, 30.4, 28.8);
const mapCameraTarget = new THREE.Vector3(0, 0, 2);
const cameraTransitionStart = new THREE.Vector3();
let cameraTransitionProgress = 1;

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
  cameraDistance = clamp(cameraDistance + event.deltaY * 0.01, 3, 18);
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
gameWorld.add(ocean);

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
gameWorld.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:0.5})));

// core
export function showIntroCamera() {
  camera.position.copy(introCameraPosition);
  camera.lookAt(introCameraTarget);
}

export function showMapCamera() {
  camera.position.copy(mapCameraPosition);
  camera.lookAt(mapCameraTarget);
}

export function showIntroWorld() {
  introWorld.visible = true;
  gameWorld.visible = false;
  showIntroCamera();
}

export function showGameWorld() {
  introWorld.visible = false;
  gameWorld.visible = true;
}

export function startGameplayCameraTransition() {
  cameraTransitionStart.copy(camera.position);
  cameraTransitionProgress = 0;
}

export function isGameplayCameraTransitionDone() {
  return cameraTransitionProgress >= 1;
}

export function updateCamera(p:THREE.Vector3){
  const horizontalDistance = Math.cos(cameraPitch) * cameraDistance;
  const target = p.clone();
  const lookAtTarget = p.clone();
  lookAtTarget.y += cameraLookAtHeightOffset;

  const gameplayPosition = new THREE.Vector3(
    target.x + Math.sin(cameraYaw) * horizontalDistance,
    target.y + Math.sin(cameraPitch) * cameraDistance,
    target.z + Math.cos(cameraYaw) * horizontalDistance
  );

  if (cameraTransitionProgress < 1) {
    cameraTransitionProgress = Math.min(cameraTransitionProgress + 0.035, 1);
    camera.position.lerpVectors(cameraTransitionStart, gameplayPosition, cameraTransitionProgress);
  } else {
    camera.position.copy(gameplayPosition);
  }

  camera.lookAt(lookAtTarget);
}

showIntroWorld();
