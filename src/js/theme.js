/**
 * Light/dark theme. Two states, per platform guidance: follow the system, or
 * pin the opposite. Pinning the same value as the system just unpins.
 *
 * Fires `themechange` on document whenever the effective theme changes
 * (toggle or OS switch), so canvas code can call its retheme().
 */
const KEY = 'color-scheme';
const root = document.documentElement;
const systemDark = matchMedia('(prefers-color-scheme: dark)');

const system = () => (systemDark.matches ? 'dark' : 'light');
export const currentTheme = () => root.dataset.theme || system();

function store(value) {
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {
    /* Storage can be blocked; the toggle still works for this page view. */
  }
}

function apply(pinned) {
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (pinned) {
    root.dataset.theme = pinned;
    if (meta) meta.content = pinned;
  } else {
    delete root.dataset.theme;
    if (meta) meta.content = 'light dark';
  }
  store(pinned);
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: currentTheme() } }));
}

export function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  apply(next === system() ? null : next);
}

systemDark.addEventListener('change', () => {
  if (!root.dataset.theme) {
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: currentTheme() } }));
  }
});

/** Wire a toggle button. Its label is fixed; aria-pressed carries the state. */
export function bindThemeToggle(button) {
  const sync = () => button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
  button.addEventListener('click', toggleTheme);
  document.addEventListener('themechange', sync);
  sync();
}
