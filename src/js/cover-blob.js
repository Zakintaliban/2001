/**
 * Cover art: a liquid-chrome blob with a thin-film sheen.
 *
 * No idle animation. It pours in once with the masthead (the page's one
 * orchestrated moment), then only turns toward the pointer and settles.
 * With reduced motion it's a still render. Colors come from CSS tokens.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { isLite, reducedMotion } from './prefs.js';
import { readTokens } from './stage/tokens.js';

/* Smooth, deterministic lumps: a few layered sine fields. */
function lump(x, y, z) {
  return (
    0.15 * Math.sin(2.1 * x + 1.3) * Math.sin(1.7 * y + 0.4) * Math.sin(2.3 * z + 2.1) +
    0.1 * Math.sin(3.4 * y + 0.7 + 1.5 * x) +
    0.06 * Math.sin(4.6 * z + 2.2 * y) +
    0.035 * Math.sin(7.2 * x - 3.1 * z)
  );
}

export function mountBlob(container) {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  container.append(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  let env = null;
  let tokens = readTokens();

  function environment() {
    const room = new RoomEnvironment();
    const panel = (color, intensity, pos, rotY) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 8),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) }),
      );
      m.position.set(...pos);
      m.rotation.y = rotY;
      room.add(m);
    };
    panel(tokens.envA, 6, [-13, 8, 3], Math.PI / 2);
    panel(tokens.envB, 5, [12, 6, -2], -Math.PI / 2);
    panel(tokens.query, 3, [0, 4, -13], 0);
    env?.dispose();
    env = pmrem.fromScene(room, 0.02);
    scene.environment = env.texture;
  }
  environment();

  // A merged icosphere: no UV seam or poles, so normals stay continuous and
  // the chrome reflection has no visible stitch.
  let geometry = new THREE.IcosahedronGeometry(1.35, 64);
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  geometry = mergeVertices(geometry);
  const p = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    v.multiplyScalar(1.35 * (1 + lump(v.x, v.y, v.z)));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhysicalMaterial({
    metalness: 1,
    roughness: 0.05,
    iridescence: 0.75,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [220, 680],
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  });
  material.color.set(tokens.chrome);
  const blob = new THREE.Mesh(geometry, material);
  blob.rotation.set(0.35, -0.6, 0.1);
  scene.add(blob);

  /* Render on demand. */
  const target = new THREE.Euler(0.35, -0.6, 0.1);
  let scale = reducedMotion() ? 1 : 0.82;
  let velocity = 0;
  let running = false;
  const timer = new THREE.Timer();

  function render() {
    renderer.render(scene, camera);
  }

  function tick(time) {
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 1 / 20);
    let moving = false;
    for (const axis of ['x', 'y']) {
      const d = target[axis] - blob.rotation[axis];
      if (Math.abs(d) > 0.0005) {
        blob.rotation[axis] += d * (1 - Math.exp(-4 * dt));
        moving = true;
      }
    }
    // One springy pour-in on load.
    if (Math.abs(1 - scale) > 0.0005 || Math.abs(velocity) > 0.0005) {
      velocity += (1 - scale) * 90 * dt;
      velocity *= Math.exp(-9 * dt);
      scale += velocity * dt;
      blob.scale.setScalar(scale);
      moving = true;
    }
    render();
    if (!moving) {
      running = false;
      renderer.setAnimationLoop(null);
    }
  }

  function start() {
    if (running) return;
    running = true;
    timer.update(performance.now());
    renderer.setAnimationLoop(tick);
  }

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(isLite() ? 1 : Math.min(devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }

  new ResizeObserver(resize).observe(container);

  const cover = container.closest('.cover') ?? container;
  cover.addEventListener('pointermove', (event) => {
    if (reducedMotion() || event.pointerType !== 'mouse') return;
    const r = cover.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    target.set(0.35 + y * 0.7, -0.6 + x * 1.1, 0.1);
    start();
  });

  document.addEventListener('themechange', () => {
    tokens = readTokens();
    material.color.set(tokens.chrome);
    environment();
    render();
  });
  document.addEventListener('litechange', resize);

  container.dataset.ready = '';
  resize();
  if (!reducedMotion()) start();
}
