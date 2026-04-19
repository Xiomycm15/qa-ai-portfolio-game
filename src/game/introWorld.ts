import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { introWorld } from './scene';

const loader = new GLTFLoader();
loader.load('/intro-game.glb', (gltf) => {
  const introModel = gltf.scene;
  fitIntroModel(introModel, 8);
  introWorld.add(introModel);
});

function fitIntroModel(model: THREE.Object3D, targetSize: number) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
  model.scale.setScalar(scale);

  const scaledBox = new THREE.Box3().setFromObject(model);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);

  model.position.sub(scaledCenter);

  const finalBox = new THREE.Box3().setFromObject(model);
  model.position.y += -finalBox.min.y;
}

export function updateIntroWorld(delta: number) {
  void delta;
}
