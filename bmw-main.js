import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.querySelector('#viewer-canvas');
const viewer = document.querySelector('#viewer');
const fallback = document.querySelector('#viewer-fallback');
const loading = document.querySelector('#viewer-loading');
const errorNotice = document.querySelector('#viewer-error');
const tabButtons = [...document.querySelectorAll('.view-tab')];
const rotateButton = document.querySelector('#rotate-button');
const colorButtons = [...document.querySelectorAll('.color-swatch')];
const customColorInput = document.querySelector('#custom-color');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#171a1c');

const camera = new THREE.PerspectiveCamera(33, 1, 0.01, 100);
camera.position.set(4.5, 2.2, 5.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

scene.add(new THREE.HemisphereLight(0xe5efff, 0x282b2e, 1.7));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(-4, 7, 5);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xb9d8ff, 2.2);
rimLight.position.set(4, 3, -5);
scene.add(rimLight);
const lowFill = new THREE.DirectionalLight(0xffe3bf, 0.8);
lowFill.position.set(2, 1, 4);
scene.add(lowFill);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.minDistance = 2.4;
controls.maxDistance = 11;
controls.minPolarAngle = 0.18;
controls.maxPolarAngle = Math.PI * 0.48;
controls.autoRotateSpeed = 0.7;
controls.target.set(0, 0.65, 0);

let modelRoot;
let carLongAxis = 'z';
let fitDistance = 5;
let activePaint = '#d6d9dc';
const paintMaterials = new Set();

function applyPaint(hex) {
  activePaint = hex;
  paintMaterials.forEach((material) => {
    if (!material || !material.color) return;
    material.color.set(hex);
    if ('metalness' in material) material.metalness = Math.max(material.metalness || 0, 0.45);
    if ('roughness' in material) material.roughness = Math.min(material.roughness ?? 0.5, 0.38);
    material.needsUpdate = true;
  });
}

function resize() {
  const width = Math.max(1, viewer.clientWidth);
  const height = Math.max(1, viewer.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function cameraPoint(kind) {
  const radius = fitDistance;
  if (kind === 'front') return carLongAxis === 'x' ? [radius, radius * 0.27, 0] : [0, radius * 0.27, radius];
  if (kind === 'rear') return carLongAxis === 'x' ? [-radius, radius * 0.27, 0] : [0, radius * 0.27, -radius];
  if (kind === 'side') return carLongAxis === 'x' ? [0, radius * 0.23, radius] : [radius, radius * 0.23, 0];
  return carLongAxis === 'x' ? [radius * 0.77, radius * 0.43, radius * 0.92] : [radius * 0.92, radius * 0.43, radius * 0.77];
}

function setView(kind, animate = true) {
  if (!modelRoot) return;
  const [x, y, z] = cameraPoint(kind);
  if (animate) {
    const start = camera.position.clone();
    const end = new THREE.Vector3(x, y, z);
    const began = performance.now();
    const duration = 650;
    const move = (now) => {
      const t = Math.min(1, (now - began) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(start, end, ease);
      if (t < 1) requestAnimationFrame(move);
    };
    requestAnimationFrame(move);
  } else {
    camera.position.set(x, y, z);
  }
  controls.target.set(0, 0.62, 0);
  controls.update();
}

function showLoadError() {
  loading.classList.add('is-hidden');
  errorNotice.hidden = false;
}

const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/libs/draco/');
loader.setDRACOLoader(draco);

loader.load(
  './assets/models/bmw-m3-competition.glb',
  (gltf) => {
    modelRoot = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(modelRoot);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    carLongAxis = size.x >= size.z ? 'x' : 'z';
    const scale = 5.7 / Math.max(size.x, size.z, size.y);
    modelRoot.scale.setScalar(scale);
    modelRoot.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    scene.add(modelRoot);

    // Preserve the source material colors while making metallic paint readable in the studio lighting.
    modelRoot.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        if (!material) return;
        if ('envMapIntensity' in material) material.envMapIntensity = 1.15;
        if (material.color) paintMaterials.add(material);
        material.needsUpdate = true;
      });
    });

    applyPaint(activePaint);

    const scaledHeight = size.y * scale;
    controls.target.set(0, Math.max(0.4, scaledHeight * 0.48), 0);
    fitDistance = Math.max(4.4, Math.max(size.x, size.z) * scale * 1.2);
    camera.position.set(...cameraPoint('hero'));
    camera.lookAt(controls.target);
    controls.update();
    fallback.classList.add('is-hidden');
    loading.classList.add('is-hidden');
  },
  undefined,
  (error) => {
    console.error('Could not load the BMW M3 Competition GLB:', error);
    showLoadError();
  }
);

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    tabButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    setView(button.dataset.view);
  });
});

rotateButton.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  rotateButton.setAttribute('aria-pressed', String(controls.autoRotate));
});

colorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const color = button.dataset.color;
    colorButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    customColorInput.value = color;
    applyPaint(color);
  });
});

customColorInput.addEventListener('input', () => {
  colorButtons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });
  applyPaint(customColorInput.value);
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}));

const observer = new ResizeObserver(resize);
observer.observe(viewer);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
