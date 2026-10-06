/** Small DOM helpers. Content is authored in this repo, but still escaped. */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESC[c]);

/** Inline markup: `code`, **strong**, *em*. Escapes everything else. */
export function md(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Strip the inline markup for plain-text uses (aria labels, titles). */
export const plain = (text) => String(text).replace(/[`*]/g, '');

export function html(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content;
}

export const pad2 = (n) => String(n).padStart(2, '0');

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** One polite live region per page (see the announcer in the HTML). */
export function announce(message) {
  const region = $('[data-announcer]');
  if (!region) return;
  region.textContent = '';
  // A short delay lets screen readers notice the change after focus moves.
  setTimeout(() => (region.textContent = message), 60);
}

export const icons = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 5.4 14 4l-8 8 8 8 1.4-1.4L8.8 12z"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m8.6 18.6 1.4 1.4 8-8-8-8-1.4 1.4 6.6 6.6z"/></svg>',
  replay:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.3 22A10 10 0 0 1 9 2.6a.8.8 0 0 1 1 .9 7.9 7.9 0 0 0 10.4 9.1.8.8 0 0 1 1 1A10 10 0 0 1 12.3 22Z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
  reset:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-1.8-4.3L14 10h6V4l-2.4 2.4A8 8 0 0 0 12 4Z"/></svg>',
  expand:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m9 16.2-3.5-3.5L4 14.2l5 5 11-11-1.4-1.4z"/></svg>',
  cross:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.3 5.7 16.9 4.3 12 9.2 7.1 4.3 5.7 5.7 10.6 12l-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9z"/></svg>',
};
