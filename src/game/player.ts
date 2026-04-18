import * as THREE from 'three';
import { renderer, scene } from './scene';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export let player: THREE.Object3D | null = null;
export let mixer: THREE.AnimationMixer | null = null;

let actions: Record<string, THREE.AnimationAction> = {};
let active: THREE.AnimationAction | null = null;

// 🧠 NUEVO: nombre del estado actual
let currentAnimation: string = "";

new GLTFLoader().load('/avatar.glb', (gltf) => {
  player = gltf.scene;
  optimizeAvatarMaterials(player);
  player.scale.setScalar(0.5);
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

function optimizeAvatarMaterials(root: THREE.Object3D) {
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    materials.forEach((material) => {
      material.transparent = false;
      material.opacity = 1;
      material.depthWrite = true;
      material.depthTest = true;
      material.alphaTest = 0.01;
      material.side = THREE.FrontSide;

      const texturedMaterial = material as THREE.MeshStandardMaterial;
      const textures = [
        texturedMaterial.map,
        texturedMaterial.normalMap,
        texturedMaterial.roughnessMap,
        texturedMaterial.metalnessMap,
        texturedMaterial.alphaMap,
      ].filter((texture): texture is THREE.Texture => Boolean(texture));

      textures.forEach((texture) => {
        texture.anisotropy = maxAnisotropy;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
      });

      if (texturedMaterial.map) {
        texturedMaterial.map.colorSpace = THREE.SRGBColorSpace;
      }

      material.needsUpdate = true;
    });
  });
}

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

export function stopAnimation() {
  if (!active) return;

  active.fadeOut(0.2);
  active = null;
  currentAnimation = "";
}
