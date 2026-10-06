/**
 * Scene for episode 01: users, Route 53, two Regions, health checkers and a
 * CloudWatch alarm. Built from the stage kit (materials bound to CSS tokens,
 * labels, contact shadows). The stage calls:
 *
 *   applyState(state, { instant })  move toward a step's state
 *   update(dt)                      advance tweens; true while anything moves
 *   route(name) / pings()           curves for packets
 *   showRoutes(names)               fade route trails in and out
 *   retheme(state)                  re-resolve token colors
 */
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export async function buildScene(kit) {
  const { THREE, mats, label, shadow } = kit;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const damp = (a, b, dt) => THREE.MathUtils.lerp(a, b, 1 - Math.exp(-6 * dt));

  const actors = new THREE.Group();
  const overlay = new THREE.Group();

  /* ---------- Animated parameters ---------- */

  const params = [];

  function param(apply, value = 0) {
    const p = {
      value,
      target: value,
      to(v, instant) {
        p.target = v;
        if (instant) p.value = v;
        apply(p.value);
      },
      step(dt) {
        if (Math.abs(p.value - p.target) < 0.002) {
          if (p.value === p.target) return false;
          p.value = p.target;
        } else {
          p.value = damp(p.value, p.target, dt);
        }
        apply(p.value);
        return true;
      },
    };
    apply(value);
    params.push(p);
    return p;
  }

  function colorParam(color, key) {
    const target = kit.color(key);
    const p = {
      key,
      to(nextKey, instant) {
        p.key = nextKey;
        target.copy(kit.color(nextKey));
        if (instant) color.copy(target);
      },
      step(dt) {
        const d = Math.abs(color.r - target.r) + Math.abs(color.g - target.g) + Math.abs(color.b - target.b);
        if (d < 0.003) {
          if (d === 0) return false;
          color.copy(target);
          return true;
        }
        color.lerp(target, 1 - Math.exp(-6 * dt));
        return true;
      },
    };
    color.copy(target);
    params.push(p);
    return p;
  }

  /* ---------- Materials ---------- */

  const chrome = mats.chrome();
  const satin = mats.chrome({ roughness: 0.24 });
  const plastic = mats.plastic('plastic');
  const shell = mats.plastic('traffic', { roughness: 0.22 });
  const iridescent = mats.iridescent('chrome');
  const screen = mats.glow('traffic', 0.7);
  const slot = new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: 0.6 });

  // Status lights. Bound to a token so a theme switch recolors them; the
  // state tweens below then retarget the ones that change color.
  const led = (key) => {
    const material = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.35 });
    material.userData.bloom = true;
    return mats.bind(material, 'emissive', key);
  };

  /* ---------- Geometry helpers ---------- */

  const box = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 4, r);
  const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    return m;
  };
  const place = (object, x, y, z) => {
    object.position.set(x, y, z);
    return object;
  };
  const addShadow = (w, d, x, y, z) => overlay.add(place(shadow(w, d), x, y + 0.012, z));

  /* ---------- Users: blobby Y2K monitors ---------- */

  const userSpots = [
    [-9.5, -1.25],
    [-8.5, 0.1],
    [-9.7, 1.45],
  ];
  const shellGeo = box(0.95, 0.78, 0.74, 0.22);
  const screenGeo = box(0.7, 0.5, 0.06, 0.05);
  for (const [x, z] of userSpots) {
    const user = new THREE.Group();
    user.add(mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.06, 32), chrome, 0, 0.03, 0));
    user.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.36, 16), chrome, 0, 0.22, 0));
    user.add(mesh(shellGeo, shell, 0, 0.78, 0));
    user.add(mesh(screenGeo, screen, 0, 0.8, 0.37));
    user.rotation.y = 0.55;
    actors.add(place(user, x, 0, z));
    addShadow(1.5, 1.5, x, 0, z);
  }
  // Nameplates sit at floor level in front of each actor, out of the way of
  // the things floating above.
  overlay.add(place(label('Users'), -9.1, 0.15, 2.55));

  /* ---------- Route 53: chrome ring, iridescent globe ---------- */

  const R53 = V(-3, 0, -0.6);
  const route53 = new THREE.Group();
  route53.add(mesh(new THREE.CylinderGeometry(0.6, 0.66, 0.1, 48), chrome, 0, 0.05, 0));
  route53.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 16), chrome, 0, 0.85, 0));
  const ring = mesh(new THREE.TorusGeometry(0.95, 0.12, 32, 120), chrome, 0, 2.45, 0);
  ring.rotation.y = 0.55;
  route53.add(ring);
  const orbit = mesh(new THREE.TorusGeometry(0.74, 0.025, 12, 96), iridescent, 0, 2.45, 0);
  orbit.rotation.set(1.1, 0.4, 0.3);
  route53.add(orbit);
  const globeMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0.3,
    roughness: 0.1,
    iridescence: 1,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [140, 520],
    clearcoat: 1,
    emissiveIntensity: 0.55,
  });
  mats.bind(globeMaterial, 'color', 'chrome');
  route53.add(mesh(new THREE.SphereGeometry(0.52, 48, 32), globeMaterial, 0, 2.45, 0));
  actors.add(place(route53, R53.x, 0, R53.z));
  addShadow(1.8, 1.8, R53.x, 0, R53.z);
  overlay.add(place(label('Route 53'), R53.x, 0.15, R53.z + 1.15));
  const globeColor = colorParam(globeMaterial.emissive, 'brand');

  // Labels that only make sense up close. Wide shots hide them; the HUD
  // carries the same facts there.
  let wide = false;
  // The record cards belong to the DNS story; close-ups of a Region skip them.
  let cardsInShot = true;
  const detailTags = [];
  const tagRules = [];
  const refreshTags = () => tagRules.forEach((rule) => rule());

  /* Failover record cards, floating beside Route 53. The text is printed on
     the card (a canvas texture in the page's own fonts), so it reads in every
     shot and scales with the scene instead of crowding it. */
  await Promise.all(
    ['800 64px "Unbounded Variable"', '40px Silkscreen'].map((font) => document.fonts?.load(font).catch(() => {})),
  );
  const cardGeo = box(2.3, 0.8, 0.08, 0.06);
  const frameGeo = box(2.45, 0.95, 0.04, 0.08);
  const faceGeo = new THREE.PlaneGeometry(2.2, 0.72);

  function card(y, key, role, region, inkKey) {
    const group = new THREE.Group();
    const frame = led(key);
    group.add(mesh(frameGeo, frame, 0, 0, -0.04));
    group.add(mesh(cardGeo, plastic));

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 210;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    let answering = false;
    const paint = () => {
      const t = kit.tokens();
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = t.plastic;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = t[inkKey];
      ctx.font = '800 64px "Unbounded Variable", "Arial Black", sans-serif';
      ctx.fillText(role, 24, 76);
      ctx.fillStyle = t.ink;
      ctx.font = '40px Silkscreen, monospace';
      ctx.fillText(region, 26, 134);
      if (answering) {
        ctx.fillStyle = t[inkKey];
        ctx.fillText('▶ ANSWERING', 26, 190);
      }
      texture.needsUpdate = true;
    };
    paint();
    const face = mesh(
      faceGeo,
      new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.35, clearcoat: 1 }),
      0,
      0,
      0.045,
    );
    group.add(face);

    group.rotation.y = -0.15;
    actors.add(place(group, -0.95, y, -0.85));
    const glow = param((v) => (frame.emissiveIntensity = v), 0.3);
    const scale = param((v) => {
      group.scale.setScalar(Math.max(v, 0.0001));
      group.visible = v > 0.01;
    }, 0);
    return {
      glow,
      scale,
      paint,
      setAnswering(on) {
        if (on === answering) return;
        answering = on;
        paint();
      },
    };
  }
  // Stacked beside the ring, clear of the Region labels in the route53 shot.
  const cardPrimary = card(3.3, 'brand', 'PRIMARY', 'US-EAST-1 · ALIAS → ALB', 'brandInk');
  const cardSecondary = card(2.15, 'standby', 'SECONDARY', 'US-WEST-2 · ALIAS → ALB', 'info');

  /* ---------- Regions: plate, ALB gate, three servers ---------- */

  const plateGeo = box(6, 0.28, 4.6, 0.14);
  const rimGeo = box(6.22, 0.1, 4.82, 0.05);
  const archGeo = new THREE.TorusGeometry(1.05, 0.14, 24, 80, Math.PI);
  const filmGeo = new THREE.CircleGeometry(0.97, 48, 0, Math.PI);
  const serverGeo = box(0.85, 1.3, 0.85, 0.08);
  const ledGeo = new THREE.BoxGeometry(0.03, 0.95, 0.12);
  const slotGeo = new THREE.BoxGeometry(0.02, 0.025, 0.55);

  function region(center, rimKey, name, variant) {
    const group = new THREE.Group();
    const rim = led(rimKey);
    group.add(mesh(rimGeo, rim, 0, 0.05, 0));
    group.add(mesh(plateGeo, plastic, 0, 0.14, 0));

    const arch = mesh(archGeo, chrome, -2.2, 0.28, 0);
    arch.rotation.y = Math.PI / 2;
    group.add(arch);
    const filmMaterial = new THREE.MeshPhysicalMaterial({
      metalness: 0.2,
      roughness: 0.1,
      iridescence: 1,
      iridescenceIOR: 1.4,
      iridescenceThicknessRange: [180, 600],
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      emissiveIntensity: 0.35,
    });
    mats.bind(filmMaterial, 'color', rimKey);
    mats.bind(filmMaterial, 'emissive', rimKey);
    const film = mesh(filmGeo, filmMaterial, -2.2, 0.28, 0);
    film.rotation.y = Math.PI / 2;
    group.add(film);

    const ledMaterial = led('ok');
    for (const dz of [-1.4, 0, 1.4]) {
      group.add(mesh(serverGeo, satin, 0.6, 0.93, dz));
      group.add(mesh(ledGeo, ledMaterial, 0.6 - 0.435, 0.93, dz));
      for (const dy of [-0.38, 0, 0.38]) group.add(mesh(slotGeo, slot, 0.6 - 0.43, 0.93 + dy, dz + 0.1));
      addShadow(1.35, 1.35, center.x + 0.6, 0.28, center.z + dz);
    }

    actors.add(place(group, center.x, 0, center.z));
    addShadow(7.6, 6.2, center.x, 0, center.z);

    const tag = place(label(name, variant), center.x - 0.4, 0.3, center.z + 2.7);
    overlay.add(tag);
    const albTag = place(label('ALB'), center.x - 2.2, 1.85, center.z);
    overlay.add(albTag);
    detailTags.push(albTag);

    return {
      rim: param((v) => (rim.emissiveIntensity = v), 0.5),
      film: param((v) => (filmMaterial.opacity = v), 0.5),
      ledColor: colorParam(ledMaterial.emissive, 'ok'),
      ledLevel: param((v) => (ledMaterial.emissiveIntensity = v), 1.5),
      tag,
    };
  }

  const P = V(5, 0, -4);
  const S = V(5, 0, 4);
  const primary = region(P, 'brand', 'us-east-1 · Primary', 'brand');
  const secondary = region(S, 'standby', 'us-west-2 · Secondary');

  /* ---------- Health checkers ---------- */

  const checkerSpots = [V(0.6, 5.4, -7.6), V(3.9, 6.3, -9.3), V(7.7, 5.2, -8.4)];
  const checkers = new THREE.Group();
  const orbGeo = new THREE.SphereGeometry(0.3, 32, 24);
  const haloGeo = new THREE.TorusGeometry(0.46, 0.035, 12, 64);
  checkerSpots.forEach((spot, k) => {
    const orb = new THREE.Group();
    orb.add(mesh(orbGeo, iridescent));
    const halo = mesh(haloGeo, chrome);
    halo.rotation.set(1.2, 0.3 * k, 0.2);
    orb.add(halo);
    checkers.add(place(orb, spot.x, spot.y, spot.z));
  });
  actors.add(checkers);
  const checkerTag = place(label('Health checkers'), 3.9, 5.5, -9.3);
  overlay.add(checkerTag);
  const checkerScale = param((v) => {
    checkers.children.forEach((orb) => orb.scale.setScalar(Math.max(v, 0.0001)));
    checkers.visible = v > 0.01;
    checkerTag.visible = v > 0.5;
  }, 0);

  /* ---------- CloudWatch alarm beacon ---------- */

  const beacon = new THREE.Group();
  beacon.add(mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.2, 32), chrome, 0, 0.1, 0));
  const domeMaterial = new THREE.MeshPhysicalMaterial({ roughness: 0.15, clearcoat: 1 });
  domeMaterial.userData.bloom = true;
  mats.bind(domeMaterial, 'color', 'plastic');
  mats.bind(domeMaterial, 'emissive', 'bad');
  beacon.add(mesh(new THREE.SphereGeometry(0.27, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMaterial, 0, 0.2, 0));
  actors.add(place(beacon, P.x + 2.45, 0.28, P.z - 1.95));
  const alarmTag = place(label('CloudWatch alarm', 'bad'), P.x + 2.45, 1.15, P.z - 1.95);
  overlay.add(alarmTag);
  const alarm = param((v) => {
    domeMaterial.emissiveIntensity = v;
    alarmTag.visible = v > 1 && !wide;
  }, 0);
  tagRules.push(() => (alarmTag.visible = alarm.value > 1 && !wide));

  /* ---------- Focus rings ---------- */

  const ringMaterial = (opacity) => {
    const m = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity });
    return mats.bind(m, 'color', 'traffic');
  };
  function focusRing(center, radius) {
    const material = ringMaterial(0);
    const m = mesh(new THREE.RingGeometry(radius - 0.07, radius, 128), material, center.x, 0.02, center.z);
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = 3;
    overlay.add(m);
    return param((v) => {
      material.opacity = v;
      m.visible = v > 0.01;
    }, 0);
  }
  const focus = {
    route53: focusRing(R53, 1.45),
    primary: focusRing(P, 4.15),
    secondary: focusRing(S, 4.15),
  };

  /* ---------- Routes ---------- */

  const USERS = V(-8.4, 1.05, 0);
  const R53_IN = V(-3.95, 2.45, -0.45);
  const gate = (c) => V(c.x - 2.25, 0.85, c.z);
  const gateTop = (c) => V(c.x - 2.25, 1.5, c.z);

  const query = new THREE.QuadraticBezierCurve3(USERS.clone().add(V(0, 0.25, -0.25)), V(-6.2, 3.9, -0.9), R53_IN);
  const answer = new THREE.QuadraticBezierCurve3(
    R53_IN.clone().add(V(0, -0.25, 0.3)),
    V(-6.2, 2.1, 0.7),
    USERS.clone().add(V(0, -0.1, 0.3)),
  );

  function trafficRoute(c, side) {
    const main = new THREE.CubicBezierCurve3(
      USERS.clone().add(V(0.2, 0, 0.2 * side)),
      V(-4.5, 1.7, 1.7 * side),
      V(-0.6, 1.4, c.z + 0.2 * side),
      gate(c),
    );
    const branches = [-1.4, 0, 1.4].map(
      (dz) =>
        new THREE.QuadraticBezierCurve3(gate(c), V(c.x - 1.2, 1.05, c.z + dz * 0.6), V(c.x + 0.14, 0.95, c.z + dz)),
    );
    return { main, branches };
  }
  const toPrimary = trafficRoute(P, -1);
  const toSecondary = trafficRoute(S, 1);

  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const routes = {
    dns: () => ({ curves: [query, answer], dropCurves: [query], color: 'query', speed: 7 }),
    primary: () => ({
      curves: [toPrimary.main, pick(toPrimary.branches)],
      dropCurves: [toPrimary.main],
      color: 'traffic',
      speed: 7.5,
    }),
    secondary: () => ({
      curves: [toSecondary.main, pick(toSecondary.branches)],
      dropCurves: [toSecondary.main],
      color: 'traffic',
      speed: 7.5,
    }),
  };

  const pingCurves = checkerSpots.map((spot) => {
    const top = gateTop(P);
    const mid = spot.clone().lerp(top, 0.5);
    return {
      to: new THREE.QuadraticBezierCurve3(spot, mid.clone().add(V(0, 0.9, 0)), top),
      back: new THREE.QuadraticBezierCurve3(top, mid.clone().add(V(0.5, -0.3, 0.4)), spot),
    };
  });

  /* Faint trails under the packets, so the path reads even when still. */
  function trail(curves, key) {
    const material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 });
    mats.bind(material, 'color', key);
    const group = new THREE.Group();
    for (const curve of curves) group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.028, 8), material));
    overlay.add(group);
    return param((v) => {
      material.opacity = v;
      group.visible = v > 0.01;
    }, 0);
  }
  const trails = {
    dns: trail([query, answer], 'query'),
    primary: trail([toPrimary.main, ...toPrimary.branches], 'traffic'),
    secondary: trail([toSecondary.main, ...toSecondary.branches], 'traffic'),
  };

  /* ---------- State ---------- */

  function applyState(state, { instant = false } = {}) {
    const healthy = state.primary === 'healthy';
    const toPrimaryAnswer = state.answer === 'primary';

    primary.ledColor.to(healthy ? 'ok' : 'bad', instant);
    primary.ledLevel.to(healthy ? (toPrimaryAnswer ? 2.2 : 1.2) : 2.6, instant);
    primary.rim.to(toPrimaryAnswer && healthy ? 1.5 : 0.35, instant);
    primary.film.to(healthy ? 0.55 : 0.12, instant);

    secondary.ledColor.to('ok', instant);
    secondary.ledLevel.to(toPrimaryAnswer ? 0.5 : 2.2, instant);
    secondary.rim.to(toPrimaryAnswer ? 0.3 : 1.5, instant);
    secondary.film.to(toPrimaryAnswer ? 0.18 : 0.55, instant);
    secondary.tag.element.classList.toggle('is-dim', toPrimaryAnswer);

    globeColor.to(toPrimaryAnswer ? 'brand' : 'standby', instant);

    const cards = state.records && cardsInShot ? 1 : 0;
    cardPrimary.scale.to(cards, instant);
    cardSecondary.scale.to(cards, instant);
    cardPrimary.glow.to(toPrimaryAnswer ? 2 : 0.2, instant);
    cardSecondary.glow.to(toPrimaryAnswer ? 0.2 : 2, instant);
    cardPrimary.setAnswering(toPrimaryAnswer);
    cardSecondary.setAnswering(!toPrimaryAnswer);

    checkerScale.to(state.checkers ? 1 : 0, instant);
    alarm.to(state.alarm ? 3.2 : 0, instant);

    for (const [name, ring] of Object.entries(focus)) ring.to(state.focus === name ? 0.75 : 0, instant);
  }

  return {
    actors,
    overlay,

    shots: {
      overview: { pos: [-8.5, 14, 23.5], target: [-0.6, 0.6, -0.4], floor: 'chrome' },
      checkers: { pos: [-4.4, 6.6, 11.5], target: [5.4, 3.4, -6.4], floor: 'grid' },
      route53: { pos: [-1.2, 4.8, 9.8], target: [-2.6, 2.3, -0.6], floor: 'grid' },
      primary: { pos: [-1, 5.6, 6.4], target: [5, 1, -4.4], floor: 'grid' },
      split: { pos: [-5.5, 18.5, 20.5], target: [-1.2, 0.2, 0.3], floor: 'chrome' },
    },

    route: (name) => routes[name](),
    pings: () => pingCurves,

    showRoutes(names) {
      for (const [name, p] of Object.entries(trails)) p.to(names.has(name) ? 0.42 : 0);
    },

    applyState,

    setShot(name) {
      wide = name === 'overview' || name === 'split';
      cardsInShot = name !== 'primary' && name !== 'checkers';
      for (const tag of detailTags) tag.visible = !wide;
      refreshTags();
    },

    update(dt) {
      let moving = false;
      for (const p of params) moving = p.step(dt) || moving;
      return moving;
    },

    retheme(state) {
      cardPrimary.paint();
      cardSecondary.paint();
      applyState(state, { instant: true });
    },
  };
}
