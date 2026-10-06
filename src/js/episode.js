import { CATALOG, liveEpisodes, loaders } from './episodes/catalog.js';
import { $, esc, html } from './dom.js';
import { mountShell } from './site.js';
import { renderMasthead } from './ui/masthead.js';
import { renderQuiz } from './ui/quiz.js';
import { createReader } from './ui/reader.js';
import { renderTicker } from './ui/ticker.js';
import { renderVersus } from './ui/versus.js';

mountShell();

const main = $('[data-episode]');
const requested = new URLSearchParams(location.search).get('id');
const id = requested ?? liveEpisodes()[0]?.id;

if (!loaders[id]) {
  const known = CATALOG.find((e) => e.id === id);
  document.title = `${known ? 'Not out yet' : 'Not found'} | AWS in 3D`;
  main.append(
    html(`
      <section class="wrap not-found">
        <p class="kicker">${known ? 'In production' : 'Not found'}</p>
        <h1 class="opener-title">${known ? `“${esc(known.title)}” isn’t out yet` : 'There’s no issue by that name'}</h1>
        <p><a href="./#contents">Back to the contents</a></p>
      </section>
    `),
  );
} else {
  const { default: ep } = await loaders[id]();
  document.title = `${ep.title} | AWS in 3D`;
  $('meta[name="description"]').content = ep.deck;

  const reader = createReader(ep);
  main.append(renderMasthead(ep), renderTicker(ep.ticker), reader.element);
  if (ep.versus) main.append(renderVersus(ep.versus));
  if (ep.quiz?.length) main.append(renderQuiz(ep.quiz, ep.domain));
  if (ep.sources?.length) {
    main.append(
      html(`
        <section class="sources wrap" aria-labelledby="sources-title">
          <h2 class="pixel" id="sources-title">Further reading</h2>
          <ul role="list">
            ${ep.sources.map((s) => `<li><a href="${esc(s.href)}" rel="noopener">${esc(s.title)}</a></li>`).join('')}
          </ul>
          <p>AWS updates these pages and the exam guide. Check them before exam day.</p>
        </section>
      `),
    );
  }
  reader.start();

  // Content renders after load, so the browser couldn't jump to #quiz or #versus itself.
  const section = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
  if (section?.matches('section')) section.scrollIntoView();
}
