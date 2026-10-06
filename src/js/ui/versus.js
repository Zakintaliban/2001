import { esc, html, md } from '../dom.js';

/** "Not the same as": a two-page versus spread with a chrome VS in the gutter. */
export function renderVersus(v) {
  const page = (side, data) => `
    <article class="page is-${side}" aria-labelledby="vs-${side}">
      <p class="pixel page-kicker">${esc(data.kicker)}</p>
      <h3 class="page-title" id="vs-${side}">${esc(data.name)}</h3>
      <dl class="page-rows">
        ${data.rows.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${md(val)}</dd></div>`).join('')}
      </dl>
    </article>`;

  return html(`
    <section class="versus wrap" id="versus" tabindex="-1" aria-labelledby="versus-title">
      <header class="opener">
        <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Exam trap</p>
        <h2 class="opener-title" id="versus-title">${esc(v.title)}</h2>
        <p class="opener-deck">${esc(v.deck)}</p>
      </header>
      <div class="spread">
        ${page('left', v.left)}
        <div class="vs" aria-hidden="true"><span class="vs-badge"><span class="chrome-text">VS</span></span></div>
        ${page('right', v.right)}
      </div>
      <p class="exam-tip"><span class="sticker" style="--tilt: -4deg">Exam tip</span> ${md(v.tip)}</p>
    </section>
  `);
}
