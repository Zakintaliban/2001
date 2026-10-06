import { $, esc, html, icons } from '../dom.js';

/**
 * Marquee ticker. Pauses on hover and focus, has a visible pause button
 * (WCAG 2.2.2), and doesn't move at all with reduced motion.
 * items: [{ label, value }] or [string]
 */
export function renderTicker(items, { heading = 'Key numbers' } = {}) {
  const list = (hidden) => `
    <ul class="ticker-list" role="list"${hidden ? ' aria-hidden="true"' : ''}>
      ${items
        .map((item) =>
          typeof item === 'string'
            ? `<li><span class="ticker-label">${esc(item)}</span></li>`
            : `<li><span class="ticker-label">${esc(item.label)}</span> <span class="ticker-value">${esc(item.value)}</span></li>`,
        )
        .join('')}
    </ul>`;

  const frag = html(`
    <div class="ticker">
      <h2 class="visually-hidden">${esc(heading)}</h2>
      <div class="ticker-window">
        <div class="ticker-track">${list(false)}${list(true)}</div>
      </div>
      <button class="ticker-toggle" type="button" aria-pressed="false">
        <span class="when-running">${icons.pause}</span><span class="when-paused">${icons.play}</span>
        <span class="visually-hidden">Pause ticker</span>
      </button>
    </div>
  `);

  const root = $('.ticker', frag);
  const toggle = $('.ticker-toggle', root);
  toggle.addEventListener('click', () => {
    const paused = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(paused));
    root.toggleAttribute('data-paused', paused);
  });

  return frag;
}
