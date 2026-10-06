/**
 * The 3D stage: a generic engine that plays an episode's steps.
 *
 * - PBR look: RoomEnvironment (tinted with two token-colored light panels)
 *   through PMREMGenerator, so chrome has something icy to reflect.
 * - Gradient sky from tokens; floor that turns into a chrome plate (with
 *   mirrored reflections) in overview shots and a grid floor elsewhere.
 * - Optional selective bloom (UnrealBloomPass) behind Lite mode: only
 *   materials flagged `userData.bloom` (packets, LEDs, the alarm) glow.
 * - Each step is a short clip: timed beats change the scene state while
 *   packets flow along routes. Clips end and hold; nothing loops.
 * - Renders on demand: the loop stops when nothing moves, when the stage is
 *   off screen, or when the tab is hidden.
 * - retheme() re-reads the CSS tokens on every `themechange`.
 *
 * The episode supplies the actors and routes (see episodes/*.scene.js).
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { isLite, markSoftwareGL, reducedMotion } from '../prefs.js';
import { createMaterialKit } from './materials.js';
import { readTokens } from './tokens.js';

const damp = (current, target, lambda, dt) => THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const FLOOR_MODES = {
  chrome: { metalness: 1, roughness: 0.22, opacity: 0.8, grid: 0.12 },
  grid: { metalness: 0.5, roughness: 0.5, opacity: 0.96, grid: 0.5 },
};

/* ---------- Canvas textures (repainted on retheme) ---------- */

function canvasTexture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repaint = (...args) => {
    paint(canvas.getContext('2d'), width, height, ...args);
    texture.needsUpdate = true;
  };
  return texture;
}

const paintSky = (ctx, w, h, t) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, t.skyTop);
  g.addColorStop(0.55, t.skyMid);
  g.addColorStop(1, t.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const paintShadow = (ctx, w, h, t) => {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, t.shadow);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

/* Grid lines in white on transparent, with the radial fade baked in. */
const paintGrid = (ctx, w, h) => {
  ctx.clearRect(0, 0, w, h);
  const cells = 26;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= cells; i++) {
    const p = (i / cells) * w;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, h);
    ctx.moveTo(0, p);
    ctx.lineTo(w, p);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = 'destination-in';
  const fade = ctx.createRadialGradient(w / 2, h / 2, w * 0.1, w / 2, h / 2, w / 2);
  fade.addColorStop(0, 'rgba(0,0,0,1)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
};

const paintFade = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

/* ---------- Packets ---------- */

function createPackets(root, geometry) {
  const live = [];
  const still = [];

  const place = (p) => p.curves[p.seg].getPointAt(Math.min(p.u, 1), p.mesh.position);

  return {
    spawn({ curves, material, speed = 6.5, delay = 0, onArrive, fizzle }) {
      const mesh = new THREE.Mesh(geometry, material);
      const p = { mesh, curves, seg: 0, u: 0, len: curves[0].getLength(), speed, delay, onArrive, fizzle };
      mesh.visible = delay <= 0;
      place(p);
      root.add(mesh);
      live.push(p);
    },

    /** Reduced motion: still packets spaced along the route. */
    freeze(curves, material, stops = [0.18, 0.42, 0.66, 0.9]) {
      const curve = curves[0];
      for (const u of stops) {
        const mesh = new THREE.Mesh(geometry, material);
        curve.getPointAt(u, mesh.position);
        root.add(mesh);
        still.push(mesh);
      }
    },

    update(dt) {
      for (let i = live.length - 1; i >= 0; i--) {
        const p = live[i];
        if (p.delay > 0) {
          p.delay -= dt;
          p.mesh.visible = p.delay <= 0;
          continue;
        }
        if (p.fading != null) {
          p.fading += dt / 0.45;
          p.mesh.scale.setScalar(1 + p.fading * 1.6);
          p.mesh.material.opacity = Math.max(0, 1 - p.fading);
          if (p.fading >= 1) {
            root.remove(p.mesh);
            p.mesh.material.dispose();
            live.splice(i, 1);
          }
          continue;
        }
        p.u += (p.speed * dt) / p.len;
        if (p.u >= 1 && p.seg < p.curves.length - 1) {
          p.seg++;
          p.u -= 1;
          p.len = p.curves[p.seg].getLength();
        }
        place(p);
        if (p.u >= 1) {
          p.onArrive?.();
          if (p.fizzle) {
            p.mesh.material = p.fizzle.clone();
            p.mesh.material.transparent = true;
            p.fading = 0;
          } else {
            root.remove(p.mesh);
            live.splice(i, 1);
          }
        }
      }
      return live.length > 0;
    },

    clear() {
      for (const p of live) {
        root.remove(p.mesh);
        if (p.fading != null) p.mesh.material.dispose();
      }
      for (const mesh of still) root.remove(mesh);
      live.length = 0;
      still.length = 0;
    },
  };
}

/* ---------- Stage ---------- */

export async function createStage({ viewport, canvas, steps, scene: sceneModule, onState }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const gl = renderer.getContext();
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = String(gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu)) markSoftwareGL();

  let tokens = readTokens();
  const kit = createMaterialKit(tokens);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(-6, 11, 19);

  /* Sky */
  const sky = canvasTexture(4, 256, paintSky);
  sky.repaint(tokens);
  scene.background = sky;

  /* Environment: the default room, plus two tinted light panels so chrome
     picks up ice blue and holo pink instead of plain grey. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTarget = null;
  function buildEnvironment() {
    const room = new RoomEnvironment();
    const panel = (color, intensity, position, rotationY, w, h) => {
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      mesh.position.set(...position);
      mesh.rotation.y = rotationY;
      room.add(mesh);
    };
    panel(tokens.envA, 5, [-13.5, 9, 2], Math.PI / 2, 12, 9);
    panel(tokens.envB, 3.5, [9, 7, -13], 0, 10, 7);
    panel(tokens.envA, 2.5, [0, 18, 0], 0, 1, 1);
    envTarget?.dispose();
    envTarget = pmrem.fromScene(room, 0.035);
    scene.environment = envTarget.texture;
    room.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose?.();
    });
  }
  buildEnvironment();

  /* Floor: plate + grid overlay + soft contact shadows. */
  const fade = canvasTexture(256, 256, paintFade);
  fade.colorSpace = THREE.NoColorSpace;
  fade.repaint();
  const { metalness, roughness, opacity } = FLOOR_MODES.chrome;
  const floorMaterial = new THREE.MeshPhysicalMaterial({
    metalness,
    roughness,
    opacity,
    alphaMap: fade,
    transparent: true,
    // The room's ceiling lights would otherwise mirror as an HDR hotspot that
    // bloom smears across the whole plate.
    envMapIntensity: 0.3,
  });
  kit.bind(floorMaterial, 'color', 'floor');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(26, 96), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = 0;
  scene.add(floor);

  const gridTexture = canvasTexture(1024, 1024, paintGrid);
  gridTexture.colorSpace = THREE.NoColorSpace;
  gridTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  gridTexture.repaint();
  const gridMaterial = kit.bind(
    new THREE.MeshBasicMaterial({ alphaMap: gridTexture, transparent: true, depthWrite: false, opacity: 0.12 }),
    'color',
    'grid',
  );
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(52, 52), gridMaterial);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.004;
  grid.renderOrder = 1;
  scene.add(grid);

  const shadowTexture = canvasTexture(128, 128, paintShadow);
  shadowTexture.repaint(tokens);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });

  /* Labels */
  const labels = new CSS2DRenderer();
  labels.domElement.className = 'labels';
  labels.domElement.setAttribute('aria-hidden', 'true');
  viewport.append(labels.domElement);

  /* Kit handed to the episode's scene builder. */
  const sceneKit = {
    THREE,
    mats: kit,
    tokens: () => tokens,
    color: (key) => new THREE.Color(tokens[key]),
    label(text, variant = '') {
      const el = document.createElement('div');
      el.className = `scene-label${variant ? ` is-${variant}` : ''}`;
      el.textContent = text;
      return new CSS2DObject(el);
    },
    shadow(width, depth) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), shadowMaterial);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.012;
      mesh.renderOrder = 2;
      return mesh;
    },
  };

  const world = await sceneModule.buildScene(sceneKit);
  scene.add(world.actors, world.overlay);

  /* Mirrored copy of the actors under the floor: a cheap reflection that
     reads as a chrome plate. Shares geometry and materials with the
     originals; transforms and visibility are synced before each render. */
  const reflection = world.actors.clone(true);
  reflection.scale.y = -1;
  scene.add(reflection);
  const mirrorPairs = [];
  {
    const a = [];
    const b = [];
    world.actors.traverse((o) => a.push(o));
    reflection.traverse((o) => b.push(o));
    a.forEach((o, i) => mirrorPairs.push([o, b[i]]));
  }
  const syncReflection = () => {
    for (const [source, copy] of mirrorPairs) {
      if (source === world.actors) continue;
      copy.visible = source.visible;
      copy.position.copy(source.position);
      copy.quaternion.copy(source.quaternion);
      copy.scale.copy(source.scale);
    }
  };

  /* Packets */
  const packetRoot = new THREE.Group();
  scene.add(packetRoot);
  const packets = createPackets(packetRoot, new THREE.SphereGeometry(0.13, 20, 14));
  const packetMaterials = new Map();
  const packetMaterial = (key) => {
    if (!packetMaterials.has(key)) {
      const material = new THREE.MeshPhysicalMaterial({
        metalness: 0.2,
        roughness: 0.2,
        iridescence: 1,
        iridescenceIOR: 1.4,
        emissiveIntensity: 1.5,
        clearcoat: 1,
      });
      material.userData.bloom = true;
      kit.bind(material, 'color', key);
      kit.bind(material, 'emissive', key);
      packetMaterials.set(key, material);
    }
    return packetMaterials.get(key);
  };

  /* Selective bloom (off in Lite). Pass 1 renders only bloom materials, with
     everything else swapped to black, through UnrealBloomPass. Pass 2 renders
     the scene normally and adds the glow on top. */
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 1.1, 0.45, 0);
  bloomComposer.addPass(bloom);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const mix = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: { baseTexture: { value: null }, bloomTexture: { value: bloomComposer.renderTarget2.texture } },
      vertexShader:
        'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader:
        'uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; void main() { gl_FragColor = texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv); }',
    }),
    'baseTexture',
  );
  mix.needsSwap = true;
  composer.addPass(mix);
  composer.addPass(new OutputPass());

  const black = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const stashed = new Map();
  const darken = (o) => {
    if (o.isMesh && !o.material.userData.bloom) {
      stashed.set(o, o.material);
      o.material = black;
    }
  };
  function renderBloom() {
    const background = scene.background;
    scene.background = null;
    scene.traverseVisible(darken);
    bloomComposer.render();
    for (const [o, material] of stashed) o.material = material;
    stashed.clear();
    scene.background = background;
  }

  /* Controls: drag to orbit. On touch, only horizontal drags orbit, so the
     page still scrolls vertically through the stage. */
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = 1.38;
  canvas.style.touchAction = 'pan-y';

  /* ---------- State ---------- */

  let lite = isLite();
  let index = 0;
  let current = { ...steps[0].state };
  let clip = null;
  let floorMode = 'chrome';
  const floorNow = { ...FLOOR_MODES.chrome };
  const cam = {
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    t: 1,
    duration: 1.4,
  };

  function applyLite() {
    lite = isLite();
    renderer.setPixelRatio(lite ? 1 : Math.min(devicePixelRatio, 2));
    reflection.visible = !lite;
    resize();
  }

  function shotFor(name) {
    const shot = world.shots[name] ?? world.shots.overview;
    const pos = new THREE.Vector3(...shot.pos);
    const target = new THREE.Vector3(...shot.target);
    // Portrait and narrow viewports: back the camera off so the shot still fits.
    const aspect = camera.aspect || 1.5;
    if (aspect < 1.45)
      pos
        .sub(target)
        .multiplyScalar(1 + (1.45 - aspect) * 0.75)
        .add(target);
    return { pos, target, floor: shot.floor ?? 'grid' };
  }

  function flyTo(name, animate) {
    const shot = shotFor(name);
    floorMode = shot.floor;
    world.setShot?.(name);
    cam.fromPos.copy(camera.position);
    cam.fromTarget.copy(controls.target);
    cam.toPos.copy(shot.pos);
    cam.toTarget.copy(shot.target);
    if (animate) {
      cam.t = 0;
    } else {
      cam.t = 1;
      camera.position.copy(shot.pos);
      controls.target.copy(shot.target);
      Object.assign(floorNow, FLOOR_MODES[floorMode]);
    }
    controls.update();
  }

  function setState(partial, instant = false) {
    current = { ...current, ...partial };
    world.applyState(current, { instant });
    onState?.(current);
  }

  function emit(flow, freeze = false) {
    if (flow.route) {
      const route = world.route(flow.route);
      const drop = flow.fate === 'drop';
      const curves = drop ? route.dropCurves : route.curves;
      if (freeze) return packets.freeze(curves, packetMaterial(drop ? 'bad' : route.color));
      packets.spawn({
        curves,
        material: packetMaterial(route.color),
        fizzle: drop ? packetMaterial('bad') : null,
        speed: route.speed,
      });
    } else if (flow.pings) {
      const result = flow.pings === 'ok' ? 'ok' : 'bad';
      world.pings().forEach(({ to, back }, k) => {
        if (freeze) return packets.freeze([back], packetMaterial(result), [0.5]);
        packets.spawn({
          curves: [to],
          material: packetMaterial('chrome'),
          delay: k * 0.22,
          speed: 7,
          onArrive: () => packets.spawn({ curves: [back], material: packetMaterial(result), speed: 7 }),
        });
      });
    }
  }

  /* Which flows are still running halfway through the clip: those are the
     ones a reduced-motion still frame shows. */
  const midFlows = (step) =>
    step.flows.filter((f) => (f.from ?? 0) <= step.duration / 2 && (f.to ?? step.duration) >= step.duration / 2);

  function play(step) {
    packets.clear();
    world.showRoutes(new Set(step.flows.map((f) => f.route).filter(Boolean)));

    if (reducedMotion()) {
      clip = null;
      setState(step.state, true);
      midFlows(step).forEach((f) => emit(f, true));
      return;
    }

    // Start from the previous step's values for whatever the beats will change.
    const prev = steps[Math.max(0, steps.indexOf(step) - 1)].state;
    const start = { ...step.state };
    for (const beat of step.beats) for (const key of Object.keys(beat.set)) start[key] = prev[key];
    setState(start);

    clip = {
      step,
      t: 0,
      beat: 0,
      flows: step.flows.map((f) => ({ ...f, next: f.from ?? 0 })),
    };
  }

  function updateClip(dt) {
    if (!clip) return false;
    const { step } = clip;
    clip.t += dt;
    while (clip.beat < step.beats.length && step.beats[clip.beat].at <= clip.t) {
      setState(step.beats[clip.beat].set);
      clip.beat++;
    }
    const end = step.duration;
    for (const flow of clip.flows) {
      const stop = Math.min(flow.to ?? end, end);
      while (clip.t >= flow.next && flow.next < stop) {
        emit(flow);
        flow.next += flow.every;
      }
    }
    if (clip.t >= end) {
      setState(step.state);
      clip = null;
    }
    return true;
  }

  function updateFloor(dt) {
    const target = FLOOR_MODES[floorMode];
    let moving = false;
    for (const key of Object.keys(target)) {
      floorNow[key] = damp(floorNow[key], target[key], 4, dt);
      if (Math.abs(floorNow[key] - target[key]) > 0.002) moving = true;
    }
    floorMaterial.metalness = floorNow.metalness;
    floorMaterial.roughness = floorNow.roughness;
    floorMaterial.opacity = floorNow.opacity;
    gridMaterial.opacity = floorNow.grid;
    return moving;
  }

  function updateCamera(dt) {
    if (cam.t >= 1) return false;
    cam.t = Math.min(1, cam.t + dt / cam.duration);
    const k = easeInOut(cam.t);
    camera.position.lerpVectors(cam.fromPos, cam.toPos, k);
    controls.target.lerpVectors(cam.fromTarget, cam.toTarget, k);
    return true;
  }

  /* ---------- Render loop (on demand) ---------- */

  const timer = new THREE.Timer();
  let running = false;
  let dirty = true;
  let onScreen = true;

  function render() {
    syncReflection();
    if (lite) {
      renderer.render(scene, camera);
    } else {
      renderBloom();
      composer.render();
    }
    labels.render(scene, camera);
  }

  function tick(time) {
    timer.update(time);
    // Clamp large gaps (tab switches) but let slow GPUs keep clip timing honest.
    const dt = Math.min(timer.getDelta(), 0.1);
    let active = false;
    active = updateCamera(dt) || active;
    active = controls.update(dt) || active;
    active = updateClip(dt) || active;
    active = packets.update(dt) || active;
    active = world.update(dt) || active;
    active = updateFloor(dt) || active;
    if (active || dirty) {
      render();
      dirty = false;
    }
    if (!active) stop();
  }

  function start() {
    if (running || !onScreen) return;
    running = true;
    timer.update(performance.now());
    renderer.setAnimationLoop(tick);
  }

  function stop() {
    running = false;
    renderer.setAnimationLoop(null);
  }

  const invalidate = () => {
    dirty = true;
    start();
  };

  controls.addEventListener('start', () => {
    cam.t = 1; // the reader takes the camera
  });
  controls.addEventListener('change', invalidate);

  function resize() {
    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    for (const c of [composer, bloomComposer]) {
      c.setPixelRatio(renderer.getPixelRatio());
      c.setSize(width, height);
    }
    labels.setSize(width, height);
    invalidate();
  }

  const resizer = new ResizeObserver(resize);
  resizer.observe(viewport);

  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) invalidate();
    else stop();
  });
  visibility.observe(viewport);

  function retheme() {
    tokens = readTokens();
    kit.retheme(tokens);
    sky.repaint(tokens);
    shadowTexture.repaint(tokens);
    buildEnvironment();
    world.retheme?.(current);
    invalidate();
  }

  document.addEventListener('themechange', retheme);
  document.addEventListener('litechange', () => {
    applyLite();
    invalidate();
  });

  applyLite();

  return {
    goTo(i, { animate = true } = {}) {
      index = i;
      const step = steps[i];
      flyTo(step.state.shot, animate && !reducedMotion());
      play(step);
      invalidate();
    },
    replay() {
      play(steps[index]);
      invalidate();
    },
    resetView() {
      flyTo(steps[index].state.shot, !reducedMotion());
      invalidate();
    },
    dispose() {
      stop();
      resizer.disconnect();
      visibility.disconnect();
      document.removeEventListener('themechange', retheme);
      packets.clear();
      controls.dispose();
      composer.dispose();
      bloomComposer.dispose();
      renderer.dispose();
      kit.dispose();
      envTarget?.dispose();
      pmrem.dispose();
      labels.domElement.remove();
    },
  };
}
