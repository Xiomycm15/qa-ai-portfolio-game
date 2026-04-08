import * as THREE from 'three';
import { scene } from './scene';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export let player: THREE.Object3D | null = null;
export let mixer: THREE.AnimationMixer | null = null;

let actions: Record<string, THREE.AnimationAction> = {};
let active: THREE.AnimationAction | null = null;

// 🧠 NUEVO: nombre del estado actual
let currentAnimation: string = "";

new GLTFLoader().load('/avatar.glb', (gltf) => {
  player = gltf.scene;
  player.position.set(0, 1, 0);
  scene.add(player);

  mixer = new THREE.AnimationMixer(player);

  gltf.animations.forEach((clip) => {
    actions[clip.name.toLowerCase()] = mixer!.clipAction(clip); // 👈 normalizamos
  });

  const idle = actions["idle"];
  if (idle) {
    active = idle;
    currentAnimation = "idle";
    active.play();
  }
});

export function playAnimation(name: string) {
  const key = name.toLowerCase(); // 👈 normalizamos
  const next = actions[key];

  // 🛡️ validación segura
  if (!next) {
    console.warn(`⚠️ Animación no encontrada: ${name}`);
    return;
  }

  // 🧠 evita reprocesar misma animación
  if (currentAnimation === key) return;

  active?.fadeOut(0.2);

  next.reset().fadeIn(0.2).play();

  active = next;
  currentAnimation = key;
}