import { $, $$, announce, esc, html, icons, md, pad2, plain } from '../dom.js';
import { bindLiteToggle } from '../prefs.js';

const clipTime = (seconds) => `0:${pad2(Math.round(seconds))}`;

/** The step panel: kicker, headline, drop-capped body, pull-quote facts, terminal. */
function panelMarkup(step, i, total) {
  const facts = step.facts?.length
    ? `<dl class="facts">
        ${step.facts
          .map(
            (f) => `<div class="fact${f.value.length > 9 ? ' is-long' : ''}">
              <dt>${md(f.value)}</dt><dd>${md(f.label)}</dd>
            </div>`,
          )
          .join('')}
      </dl>`
    : '';

  const terminal = step.console
    ? `<section class="terminal" aria-labelledby="terminal-title">
        <div class="terminal-bar">
          <span class="terminal-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <h4 class="terminal-title" id="terminal-title"><span class="visually-hidden">Console clicks: </span>${esc(step.console.title)}</h4>
        </div>
        <ol class="terminal-lines" role="list">
          ${step.console.lines
            .map((line) =>
              line.path
                ? `<li class="is-path"><span class="mark" aria-hidden="true">▸</span> ${line.path
                    .map((p) => `<span>${esc(p)}</span>`)
                    .join('<span class="sep" aria-hidden="true"> › </span>')}</li>`
                : `<li class="is-field"><span class="k">${esc(line.field)}</span><span class="eq" aria-hidden="true">=</span><span class="v${line.tone ? ` is-${line.tone}` : ''}">${esc(line.value)}</span></li>`,
            )
            .join('')}
        </ol>
        ${step.console.note ? `<p class="terminal-note">${md(step.console.note)}</p>` : ''}
      </section>`
    : '';

  return `
    <header class="panel-head">
      <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Step ${pad2(i + 1)} of ${pad2(total)} · ${esc(step.kicker)}</p>
      <h3 class="panel-title" id="panel-title" tabindex="-1">${esc(step.title)}</h3>
    </header>
    <div class="panel-body">${step.body.map((p) => `<p>${md(p)}</p>`).join('')}</div>
    ${facts}
    ${terminal}
  `;
}

function hudMarkup(state) {
  const primaryOk = state.primary === 'healthy';
  const chip = (label, value, tone) =>
    `<li class="hud-chip${tone ? ` is-${tone}` : ''}"><span class="hud-label">${label}</span> <span class="hud-value">${value}</span></li>`;
  return [
    chip('us-east-1', primaryOk ? `${icons.check} Healthy` : `${icons.cross} Unhealthy`, primaryOk ? 'ok' : 'bad'),
    chip(
      'DNS answer',
      state.answer === 'primary' ? 'us-east-1' : 'us-west-2',
      state.answer === 'primary' ? '' : 'info',
    ),
    state.checkers
      ? chip(
          'Failed checks',
          `${state.failCount} / 3`,
          state.failCount >= 3 ? 'bad' : state.failCount > 0 ? 'warn' : '',
        )
      : '',
    state.checkers ? chip('Alarm', state.alarm ? 'In alarm' : 'OK', state.alarm ? 'bad' : 'ok') : '',
  ].join('');
}

export function createReader(ep) {
  const steps = ep.steps;
  const total = steps.length;

  const frag = html(`
    <section class="reader wrap" id="reader" tabindex="-1" aria-labelledby="reader-title">
      <h2 class="visually-hidden" id="reader-title">${esc(ep.title)}, step by step</h2>

      <nav class="rail" aria-label="Steps">
        <p class="rail-head pixel" aria-hidden="true"><span>Playlist</span><span>${total} tracks</span></p>
        <ol role="list">
          ${steps
            .map(
              (s, i) => `<li>
                <button class="rail-pill" type="button" data-step="${i}">
                  <span class="num" aria-hidden="true">${pad2(i + 1)}</span>
                  <span class="name"><span class="visually-hidden">Step ${i + 1}: </span>${esc(s.rail)}</span>
                  <span class="time" aria-hidden="true">${clipTime(s.duration)}</span>
                </button>
              </li>`,
            )
            .join('')}
        </ol>
      </nav>

      <figure class="stage" aria-labelledby="stage-caption">
        <div class="window">
          <div class="window-bar">
            <div class="bubbles">
              <button class="bubble is-ice" type="button" data-reset-view title="Reset view">${icons.reset}<span class="visually-hidden">Reset view</span></button>
              <button class="bubble is-chrome" type="button" data-lite-toggle title="Lite mode">${icons.bolt}<span class="visually-hidden">Lite mode</span></button>
              <button class="bubble is-brand" type="button" data-fullscreen title="Full screen" hidden>${icons.expand}<span class="visually-hidden">Full screen</span></button>
            </div>
            <p class="window-title" data-scene-title></p>
            <span class="window-badge pixel" aria-hidden="true">3D</span>
          </div>

          <div class="viewport" data-viewport>
            <canvas data-canvas role="img" aria-label="3D scene of the current step. The caption below describes it."></canvas>
            <ul class="hud pixel" role="list" data-hud></ul>
            <p class="viewport-note pixel" data-stage-status>Loading 3D…</p>
          </div>

          <div class="window-toolbar">
            <button class="btn" type="button" data-prev>${icons.prev}<span>Prev</span></button>
            <p class="counter pixel" aria-hidden="true"><span data-counter></span></p>
            <button class="btn" type="button" data-replay>${icons.replay}<span>Replay</span></button>
            <button class="btn btn-primary" type="button" data-next><span data-next-label>Next</span>${icons.next}</button>
          </div>
        </div>
        <figcaption class="stage-caption" id="stage-caption" data-caption></figcaption>
      </figure>

      <article class="step-panel" data-panel aria-labelledby="panel-title"></article>
    </section>
  `);

  const root = $('.reader', frag);
  const pills = $$('.rail-pill', root);
  const panel = $('[data-panel]', root);
  const caption = $('[data-caption]', root);
  const sceneTitle = $('[data-scene-title]', root);
  const counter = $('[data-counter]', root);
  const hud = $('[data-hud]', root);
  const prev = $('[data-prev]', root);
  const next = $('[data-next]', root);
  const nextLabel = $('[data-next-label]', root);
  const replay = $('[data-replay]', root);
  const status = $('[data-stage-status]', root);
  const fullscreen = $('[data-fullscreen]', root);
  const figure = $('.stage', root);

  const linked = steps.findIndex((s) => `#${s.id}` === location.hash);
  let index = Math.max(0, linked);
  let stage = null;

  const setHud = (state) => {
    hud.innerHTML = hudMarkup(state);
  };

  // Keep the current pill visible when the rail is a horizontal strip,
  // without scrolling the page itself.
  function revealPill(pill) {
    const list = pill.closest('ol');
    if (list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2 });
  }

  function show(i, { animate = true, focus = false, speak = true, updateHash = true } = {}) {
    index = Math.min(Math.max(i, 0), total - 1);
    const step = steps[index];

    pills.forEach((pill, k) => {
      if (k === index) pill.setAttribute('aria-current', 'step');
      else pill.removeAttribute('aria-current');
      if (k < index) pill.dataset.played = '';
    });
    revealPill(pills[index]);

    panel.innerHTML = panelMarkup(step, index, total);
    panel.toggleAttribute('data-entering', animate);
    requestAnimationFrame(() => requestAnimationFrame(() => panel.removeAttribute('data-entering')));

    sceneTitle.textContent = `Scene ${pad2(index + 1)} · ${plain(step.rail)}`;
    caption.innerHTML = `<span class="fig pixel">Fig. ${pad2(index + 1)}</span> ${md(step.caption)}`;
    counter.textContent = `Step ${pad2(index + 1)} / ${pad2(total)}`;

    prev.setAttribute('aria-disabled', String(index === 0));
    nextLabel.textContent = index === total - 1 ? 'Take the quiz' : 'Next';

    if (updateHash) history.replaceState(null, '', `${location.pathname}${location.search}#${step.id}`);
    setHud(step.state);
    stage?.goTo(index, { animate });

    if (focus) $('#panel-title', panel).focus({ preventScroll: true });
    if (speak) announce(`Step ${index + 1} of ${total}: ${step.title}`);
  }

  pills.forEach((pill, k) => pill.addEventListener('click', () => show(k)));

  prev.addEventListener('click', () => {
    if (index > 0) show(index - 1);
  });

  next.addEventListener('click', () => {
    if (index < total - 1) return show(index + 1);
    const quiz = document.getElementById('quiz');
    quiz?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    quiz?.focus({ preventScroll: true });
  });

  replay.addEventListener('click', () => stage?.replay());

  root.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input, textarea, select')) return;
    if (event.key === 'ArrowRight' && index < total - 1) {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      show(index - 1);
    }
  });

  bindLiteToggle($('[data-lite-toggle]', root));

  if (document.fullscreenEnabled) {
    fullscreen.hidden = false;
    fullscreen.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else figure.requestFullscreen?.();
    });
    document.addEventListener('fullscreenchange', () =>
      fullscreen.setAttribute('aria-pressed', String(document.fullscreenElement === figure)),
    );
  }

  async function startStage() {
    try {
      const [{ createStage }, scene] = await Promise.all([import('../stage/stage.js'), ep.loadScene()]);
      stage = await createStage({
        viewport: $('[data-viewport]', root),
        canvas: $('[data-canvas]', root),
        steps,
        scene,
        onState: setHud,
      });
      $('[data-reset-view]', root).addEventListener('click', () => stage.resetView());
      status.hidden = true;
      stage.goTo(index, { animate: false });
    } catch (error) {
      console.warn('3D stage unavailable:', error);
      status.textContent = '3D view unavailable on this device. The caption below describes each scene.';
      root.querySelector('[data-viewport]').dataset.fallback = '';
      replay.setAttribute('aria-disabled', 'true');
    }
  }

  return {
    element: frag,
    start() {
      // Leave a non-step hash (#quiz, #versus) alone so the page can jump there.
      show(index, { animate: false, speak: false, updateHash: linked >= 0 });
      startStage();
    },
  };
}
