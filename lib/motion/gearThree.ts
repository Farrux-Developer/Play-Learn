/**
 * Lazy-loaded Three.js WebGL glossy clearcoat 24/36/18 gear train for high-tier devices.
 * Isolated from GearTrain.tsx so WebGL setup code does not bloat the landing initial JS bundle.
 */

import { motionCore } from './core';

export async function mountThreeGearTrain(
  container: HTMLDivElement,
  options: {
    getLookOffset: () => { x: number; y: number };
    getBoost: () => number;
    getSnapDeg: () => number;
    isCancelled: () => boolean;
  }
): Promise<(() => void) | null> {
  const [THREE, { RoomEnvironment }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/environments/RoomEnvironment.js'),
  ]);
  if (options.isCancelled()) return null;

  const width = Math.max(220, container.clientWidth || 280);
  const height = Math.max(160, container.clientHeight || 190);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'h-full w-full pointer-events-none';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 30);
  camera.position.set(0, 0, 7.6);

  const keyLight = new THREE.DirectionalLight(0xfff4dc, 1.4);
  keyLight.position.set(3, 4, 5);
  const rimLight = new THREE.DirectionalLight(0x55decc, 0.8);
  rimLight.position.set(-4, -2, 3);
  scene.add(keyLight, rimLight);

  const makeGearGeometry = (
    outerR: number,
    innerR: number,
    holeR: number,
    teeth: number,
    depth: number
  ) => {
    const shape = new THREE.Shape();
    const step = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i += 1) {
      const a0 = i * step;
      const a1 = a0 + step * 0.22;
      const a2 = a0 + step * 0.48;
      const a3 = a0 + step * 0.72;
      if (i === 0) shape.moveTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
      else shape.lineTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
      shape.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
      shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
      shape.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
    }
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, holeR, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 2,
    });
  };

  const matCobalt = new THREE.MeshPhysicalMaterial({
    color: 0x0f4c81,
    metalness: 0.2,
    roughness: 0.28,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const matGlaze = new THREE.MeshPhysicalMaterial({
    color: 0x19b7a6,
    metalness: 0.18,
    roughness: 0.24,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const matSaffron = new THREE.MeshPhysicalMaterial({
    color: 0xf5a800,
    metalness: 0.45,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
  });

  const g24Geo = makeGearGeometry(0.95, 0.8, 0.28, 24, 0.18);
  const g36Geo = makeGearGeometry(1.32, 1.15, 0.42, 36, 0.22);
  const g18Geo = makeGearGeometry(0.72, 0.59, 0.22, 18, 0.16);

  const g24 = new THREE.Mesh(g24Geo, matCobalt);
  g24.position.set(-1.38, -0.1, -0.1);
  const g36 = new THREE.Mesh(g36Geo, matGlaze);
  g36.position.set(0.32, 0.22, -0.22);
  const g18 = new THREE.Mesh(g18Geo, matSaffron);
  g18.position.set(1.62, -0.58, -0.05);

  const rig = new THREE.Group();
  rig.add(g24, g36, g18);
  scene.add(rig);

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  let isVisible = true;
  let baseAngle = 0;
  let lastSnap = options.getSnapDeg();

  const offVis = motionCore.observeVisibility(container, (vis) => {
    isVisible = vis;
  });

  const offTick = motionCore.registerTicker((_t, dt) => {
    if (!isVisible) return;
    const radPerSec = ((6 * Math.PI) / 180) * options.getBoost();
    const curSnap = options.getSnapDeg();
    if (curSnap !== lastSnap) {
      baseAngle += ((curSnap - lastSnap) * Math.PI) / 180;
      lastSnap = curSnap;
    }
    baseAngle += radPerSec * (dt / 1000);
    g24.rotation.z = baseAngle;
    g36.rotation.z = -baseAngle * (24 / 36);
    g18.rotation.z = baseAngle * (24 / 18);

    const look = options.getLookOffset();
    const targetRx = look.y * ((3.5 * Math.PI) / 180);
    const targetRy = look.x * ((4 * Math.PI) / 180);
    rig.rotation.x += (targetRx - rig.rotation.x) * 0.12;
    rig.rotation.y += (targetRy - rig.rotation.y) * 0.12;

    renderer.render(scene, camera);
  });

  const onLost = (e: Event) => e.preventDefault();
  renderer.domElement.addEventListener('webglcontextlost', onLost);

  return () => {
    offVis();
    offTick();
    renderer.domElement.removeEventListener('webglcontextlost', onLost);
    g24Geo.dispose();
    g36Geo.dispose();
    g18Geo.dispose();
    matCobalt.dispose();
    matGlaze.dispose();
    matSaffron.dispose();
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}
