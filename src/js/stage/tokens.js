/**
 * Scene colors come from CSS tokens (tokens.css, tier 3 "--scene-*"), so the
 * 3D world follows the theme. Read them again on every `themechange`.
 */
const MAP = {
  skyTop: '--scene-sky-top',
  skyMid: '--scene-sky-mid',
  skyBottom: '--scene-sky-bottom',
  floor: '--scene-floor',
  grid: '--scene-grid',
  chrome: '--scene-chrome',
  plastic: '--scene-plastic',
  brand: '--scene-brand',
  standby: '--scene-standby',
  query: '--scene-query',
  traffic: '--scene-traffic',
  ok: '--scene-ok',
  bad: '--scene-bad',
  warn: '--scene-warn',
  envA: '--scene-env-a',
  envB: '--scene-env-b',
  shadow: '--scene-shadow',
  // Ink for text printed inside the scene (record cards).
  ink: '--ink',
  brandInk: '--brand-ink',
  info: '--info',
};

export function readTokens(element = document.documentElement) {
  const styles = getComputedStyle(element);
  const tokens = {};
  for (const [key, property] of Object.entries(MAP)) {
    tokens[key] = styles.getPropertyValue(property).trim() || '#808080';
  }
  return tokens;
}
