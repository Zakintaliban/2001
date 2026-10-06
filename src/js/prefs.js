/**
 * Motion and rendering preferences shared by the page and the 3D stage.
 *
 * Lite mode turns off bloom and the floor reflection and caps the pixel
 * ratio. It's on by default for reduced motion, low-end devices and software
 * WebGL; the reader can override it either way and the choice is remembered.
 */
const LITE_KEY = 'lite-mode';
const motion = matchMedia('(prefers-reduced-motion: reduce)');

let softwareGL = false;

export const reducedMotion = () => motion.matches;

export function onReducedMotionChange(callback) {
  motion.addEventListener('change', () => callback(motion.matches));
}

function stored() {
  try {
    return localStorage.getItem(LITE_KEY);
  } catch {
    return null;
  }
}

function lowEnd() {
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  const saveData = navigator.connection?.saveData === true;
  return cores <= 4 || memory <= 4 || saveData;
}

export const liteIsAuto = () => stored() == null;

export function isLite() {
  const choice = stored();
  if (choice === 'on') return true;
  if (choice === 'off') return false;
  return motion.matches || lowEnd() || softwareGL;
}

function emit() {
  document.dispatchEvent(new CustomEvent('litechange', { detail: { lite: isLite() } }));
}

export function setLite(on) {
  try {
    localStorage.setItem(LITE_KEY, on ? 'on' : 'off');
  } catch {
    /* Not persisted, still applied below. */
  }
  emit();
}

/** Called by the stage once it knows the GPU is a software rasterizer. */
export function markSoftwareGL() {
  if (softwareGL) return;
  softwareGL = true;
  if (liteIsAuto()) emit();
}

motion.addEventListener('change', () => {
  if (liteIsAuto()) emit();
});

export function bindLiteToggle(button) {
  const sync = () => button.setAttribute('aria-pressed', String(isLite()));
  button.addEventListener('click', () => setLite(!isLite()));
  document.addEventListener('litechange', sync);
  sync();
}
