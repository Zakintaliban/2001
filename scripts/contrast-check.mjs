#!/usr/bin/env node
/**
 * WCAG 2.2 AA contrast check for every text/background pair the components use.
 *
 * Reads src/styles/tokens.css, resolves var() chains for the light theme and
 * the dark theme, and checks each pair below. Also fails if the two copies of
 * the dark block (OS preference vs. pinned) have drifted apart.
 *
 *   npm run check:contrast
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)), 'utf8');

/* ---------- Pairs: [foreground, background, minimum ratio, what it is] ---------- */

const AA = 4.5;
const LARGE = 3; // ≥ 24px, or ≥ 18.66px bold; also UI boundaries and focus rings

const pairs = [
  ['--ink', '--surface-page', AA, 'body text on paper'],
  ['--ink', '--surface-panel', AA, 'reading panels'],
  ['--ink', '--surface-sunken', AA, 'inline code, sunken wells'],
  ['--ink-muted', '--surface-page', AA, 'captions, folios'],
  ['--ink-muted', '--surface-panel', AA, 'secondary text in panels'],
  ['--ink-muted', '--surface-sunken', AA, 'secondary text in wells'],
  ['--brand-ink', '--surface-page', AA, 'links, kickers on paper'],
  ['--brand-ink', '--surface-panel', AA, 'kickers, drop caps in panels'],
  ['--on-brand', '--brand', AA, 'masthead, primary buttons, rail current'],
  ['--on-brand-muted', '--brand', AA, 'masthead deck and issue line'],
  ['--on-brand', '--bordeaux-500', AA, 'primary button gradient, top stop'],
  ['--on-brand', '--brand-deep', AA, 'primary button gradient, bottom stop'],
  ['--chrome-1', '--brand', LARGE, 'chrome display type, stop 1'],
  ['--chrome-2', '--brand', LARGE, 'chrome display type, stop 2'],
  ['--chrome-3', '--brand', LARGE, 'chrome display type, stop 3'],
  ['--chrome-4', '--brand', LARGE, 'chrome display type, stop 4 (darkest)'],
  ['--on-pop', '--pop', AA, 'lime stickers and domain badges'],
  ['--on-holo', '--holo-1', AA, 'holo foil, pink stop'],
  ['--on-holo', '--holo-2', AA, 'holo foil, lilac stop'],
  ['--on-holo', '--holo-3', AA, 'holo foil, ice stop'],
  ['--on-holo', '--holo-4', AA, 'holo foil, mint stop'],
  ['--on-chrome', '--brushed-a', AA, 'brushed chrome buttons, top'],
  ['--on-chrome', '--brushed-b', AA, 'brushed chrome buttons, middle'],
  ['--on-chrome', '--brushed-c', AA, 'brushed chrome buttons, bottom'],
  ['--ok', '--surface-panel', AA, 'status text: ok'],
  ['--warn', '--surface-panel', AA, 'status text: warn'],
  ['--bad', '--surface-panel', AA, 'status text: bad'],
  ['--info', '--surface-panel', AA, 'status text: info'],
  ['--ok', '--surface-page', AA, 'status text on paper: ok'],
  ['--bad', '--surface-page', AA, 'status text on paper: bad'],
  ['--on-status', '--ok', AA, 'CORRECT sticker'],
  ['--on-status', '--bad', AA, 'TRY AGAIN sticker'],
  ['--on-status', '--warn', AA, 'warn chip'],
  ['--on-status', '--info', AA, 'info chip'],
  ['--console-ink', '--console-bg', AA, 'terminal text'],
  ['--console-key', '--console-bg', AA, 'terminal field names'],
  ['--console-path', '--console-bg', AA, 'terminal breadcrumbs and values'],
  ['--console-mark', '--console-bg', AA, 'terminal prompt marks'],
  ['--console-ink', '--console-bar', AA, 'terminal title bar'],
  ['--ok-300', '--console-bg', AA, 'terminal status: ok'],
  ['--bad-300', '--console-bg', AA, 'terminal status: bad'],
  ['--brand-ink', '--scene-plastic', AA, 'record card role, primary'],
  ['--info', '--scene-plastic', AA, 'record card role, secondary'],
  ['--ink', '--scene-plastic', AA, 'record card region line'],
  ['--ticker-ink', '--ticker-bg', AA, 'ticker labels'],
  ['--ticker-value', '--ticker-bg', AA, 'ticker values'],
  ['--on-glow', '--glow', AA, 'text on ice highlight'],
  ['--focus', '--surface-page', LARGE, 'focus ring on paper'],
  ['--focus', '--surface-panel', LARGE, 'focus ring on panels'],
  ['--rule', '--surface-panel', LARGE, 'control and panel boundaries'],
  ['--rule', '--surface-page', LARGE, 'control boundaries on paper'],
];

/* ---------- Parse ---------- */

/** Body of the first block whose selector matches `selector` (a RegExp). */
function blockAfter(selector, from = 0) {
  const match = new RegExp(selector.source, 'g');
  match.lastIndex = from;
  const found = match.exec(css);
  if (!found) throw new Error(`Block not found: ${selector}`);
  const open = css.indexOf('{', found.index);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`Unclosed block: ${selector}`);
}

function declarations(block) {
  const out = new Map();
  // Drop nested blocks and comments; keep this block's own declarations.
  const flat = block.replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0;
  let own = '';
  for (const ch of flat) {
    if (ch === '{') depth++;
    if (depth === 0) own += ch;
    if (ch === '}') depth--;
  }
  for (const m of own.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out.set(m[1], m[2].trim().replace(/\s+/g, ' '));
  return out;
}

// Quote-agnostic, so a formatter switching " to ' can't break the check.
const light = declarations(blockAfter(/:root\s*\{/, css.indexOf('@layer tokens')));
const darkMedia = declarations(blockAfter(/:root:not\(\[data-theme=["']light["']\]\)\s*\{/));
const darkPinned = declarations(blockAfter(/:root\[data-theme=["']dark["']\]\s*\{/));

/* ---------- Color math ---------- */

function resolve(name, vars, seen = new Set()) {
  if (seen.has(name)) throw new Error(`Cycle at ${name}`);
  seen.add(name);
  const raw = vars.get(name);
  if (raw == null) throw new Error(`Unknown token ${name}`);
  const ref = raw.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(ref[1], vars, seen) : raw;
}

function parseColor(value) {
  let m = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  m = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:\s*[/,]\s*([\d.]+))?\s*\)$/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] };
  if (/^white$/i.test(value)) return { r: 255, g: 255, b: 255, a: 1 };
  if (/^black$/i.test(value)) return { r: 0, g: 0, b: 0, a: 1 };
  throw new Error(`Can't parse color "${value}"`);
}

const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});

function luminance({ r, g, b }) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- Run ---------- */

let failures = 0;

const drift = [...new Set([...darkMedia.keys(), ...darkPinned.keys()])].filter(
  (k) => darkMedia.get(k) !== darkPinned.get(k),
);
if (drift.length) {
  failures++;
  console.error(`✗ Dark blocks differ (keep them identical): ${drift.join(', ')}`);
} else {
  console.log(`✓ Dark blocks in sync (${darkMedia.size} tokens)`);
}

for (const [theme, vars] of [
  ['light', light],
  ['dark', new Map([...light, ...darkPinned])],
]) {
  console.log(`\n${theme.toUpperCase()}`);
  for (const [fgName, bgName, min, what] of pairs) {
    const bg = parseColor(resolve(bgName, vars));
    const fg = over(parseColor(resolve(fgName, vars)), bg);
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`${ok ? '✓' : '✗'} ${r.toFixed(2).padStart(5)} ≥ ${min}  ${fgName} on ${bgName}  (${what})`);
  }
}

if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll contrast checks pass WCAG 2.2 AA.');
