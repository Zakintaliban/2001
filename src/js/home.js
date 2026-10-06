import { DOMAINS, EXAM } from './data/domains.js';
import { $, $$, esc, html, pad2 } from './dom.js';
import { CATALOG } from './episodes/catalog.js';
import { reducedMotion } from './prefs.js';
import { mountShell } from './site.js';
import { renderTicker } from './ui/ticker.js';

mountShell();

const main = $('[data-home]');
const cover = CATALOG.find((e) => e.status === 'live');
const coverHref = `episode.html?id=${encodeURIComponent(cover.id)}`;
const TILTS = [-1.6, 1.2, -0.7, 1.9, -1.1, 0.6];

/* ---------- Cover ---------- */

main.append(
  html(`
    <section class="cover" aria-labelledby="cover-title">
      <div class="wrap cover-grid">
        <p class="issue-line pixel">
          <span>The Millennium Issue</span><span class="sparkle" aria-hidden="true"></span>
          <span>Vol. 1 · Issue ${pad2(cover.number)}</span><span class="sparkle" aria-hidden="true"></span>
          <span>Oct 2026</span>
          <span class="issue-exam">Free · No plug-ins required</span>
        </p>

        <h1 class="cover-logo" id="cover-title">
          <span class="chrome-text">AWS</span> <em>in</em> <span class="chrome-text">3D</span>
        </h1>

        <div class="cover-art" data-cover-art aria-hidden="true">
          <span class="sparkle" style="--x: 8%; --y: 12%; --s: 2.25rem"></span>
          <span class="sparkle" style="--x: 86%; --y: 20%; --s: 1rem; --c: var(--holo-3)"></span>
          <span class="sparkle" style="--x: 80%; --y: 82%; --s: 1.75rem; --c: var(--holo-1)"></span>
          <span class="sparkle" style="--x: 14%; --y: 78%; --s: 0.85rem; --c: var(--ice-300)"></span>
        </div>

        <ul class="cover-lines" role="list">
          <li>
            <a href="${coverHref}">
              <span class="pixel">Cover story · p. ${pad2(cover.number)}</span>
              <strong>Failover in ninety seconds</strong>
              <span class="cover-sub">${esc(cover.deck)}</span>
            </a>
          </li>
          <li>
            <a href="${coverHref}#versus">
              <span class="pixel">The showdown</span>
              <strong>Route 53 vs. ELB health checks</strong>
              <span class="cover-sub">Two checks, two jobs. The exam loves to swap them.</span>
            </a>
          </li>
          <li>
            <a href="${coverHref}#quiz">
              <span class="pixel">Exam prep</span>
              <strong>Three tickets to the exam</strong>
              <span class="cover-sub">Questions with the reasoning behind every option.</span>
            </a>
          </li>
        </ul>

        <div class="cover-side">
          <p class="burst" style="--tilt: 9deg"><span>New!<small>Issue ${pad2(cover.number)}</small></span></p>
          <p class="sticker is-holo" style="--tilt: -6deg">${esc(EXAM.code)} ready</p>
          <p class="sticker cover-chrome" style="--tilt: 4deg">Real-time 3D inside</p>
          <p class="barcode" aria-hidden="true"><span class="bars"></span>9 770200 100107</p>
        </div>
      </div>
    </section>
  `),
);

main.append(
  renderTicker(
    [
      'Exam topics as 3D episodes',
      `Built for ${EXAM.code}`,
      'Runs in your browser',
      'No plug-ins, no dial-up',
      `Now showing: ${cover.title}`,
      'Step through, then take the quiz',
    ],
    { heading: 'Also in this issue' },
  ),
);

/* ---------- Contents ---------- */

const byDomain = DOMAINS.map((d) => ({ ...d, episodes: CATALOG.filter((e) => e.domain === d.id) }));

const coverage = byDomain
  .map((d) => {
    const live = d.episodes.filter((e) => e.status === 'live').length;
    const planned = d.episodes.length - live;
    return `
      <li class="${live ? 'is-covered' : ''}" style="--w: ${d.weight}">
        <span class="cov-id" aria-hidden="true">${d.id}</span>
        <span class="cov-weight" aria-hidden="true">${d.weight}%</span>
        <span class="visually-hidden">${d.id}, ${esc(d.name)}: ${d.weight}% of the exam. ${live} live, ${planned} planned.</span>
        <span class="cov-count" aria-hidden="true">${live} live · ${planned} soon</span>
      </li>`;
  })
  .join('');

let n = 0;
const card = (ep) => {
  const tilt = TILTS[n++ % TILTS.length];
  const live = ep.status === 'live';
  const href = `episode.html?id=${encodeURIComponent(ep.id)}`;
  return `
    <li class="card-slot" style="--tilt: ${tilt}deg">
      <article class="card ${live ? 'is-live' : 'is-planned'}" aria-labelledby="card-${esc(ep.id)}">
        <div class="card-art" aria-hidden="true">
          <span class="card-number ${live ? 'chrome-text' : ''}">${pad2(ep.number)}</span>
          <span class="sparkle"></span><span class="sparkle"></span>
        </div>
        <div class="card-body">
          <p class="card-folio pixel">Issue ${pad2(ep.number)} · ${esc(ep.domain)}</p>
          <h4 class="card-title" id="card-${esc(ep.id)}">
            ${live ? `<a href="${href}">${esc(ep.title)}</a>` : esc(ep.title)}
          </h4>
          <p class="card-deck">${esc(ep.deck)}</p>
          <p class="card-services pixel">${ep.services.map(esc).join(' · ')}</p>
        </div>
        ${live && ep.isNew ? '<span class="sticker card-sticker" style="--tilt: 8deg">New</span>' : ''}
        ${live ? '' : '<span class="stamp pixel card-stamp">In production</span>'}
      </article>
    </li>`;
};

main.append(
  html(`
    <section class="contents wrap" id="contents" tabindex="-1" aria-labelledby="contents-title">
      <header class="opener">
        <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Table of contents</p>
        <h2 class="opener-title" id="contents-title">In this issue</h2>
        <p class="opener-deck">Episodes are filed by ${esc(EXAM.code)} exam domain. The strip shows how much of the exam each domain is worth, and how much of it we cover so far.</p>
      </header>

      <figure class="coverage">
        <figcaption class="pixel">Exam coverage · ${esc(EXAM.code)}</figcaption>
        <ol class="coverage-bar" role="list">${coverage}</ol>
      </figure>

      <div class="toc">
        ${byDomain
          .map(
            (d) => `
          <section class="toc-domain" aria-labelledby="toc-${d.id}">
            <h3 class="toc-head" id="toc-${d.id}">
              <span class="toc-id">${d.id}</span>
              <span class="toc-name">${esc(d.name)}</span>
              <span class="toc-weight pixel">${d.weight}% of exam</span>
            </h3>
            <ul class="cards" role="list">${d.episodes.map(card).join('')}</ul>
          </section>`,
          )
          .join('')}
      </div>
    </section>
  `),
);

/* ---------- Card tilt (fine pointers, motion allowed) ---------- */

if (matchMedia('(pointer: fine)').matches) {
  for (const el of $$('.card.is-live')) {
    el.addEventListener('pointermove', (event) => {
      if (reducedMotion()) return;
      const r = el.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width;
      const y = (event.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
      el.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      for (const p of ['--rx', '--ry', '--mx', '--my']) el.style.removeProperty(p);
    });
  }
}

/* ---------- Cover art: a liquid-chrome blob, loaded after the page ---------- */

import('./cover-blob.js')
  .then(({ mountBlob }) => mountBlob($('[data-cover-art]')))
  .catch((error) => console.warn('Cover art unavailable:', error));
