import { domainById, EXAM } from '../data/domains.js';
import { esc, html, pad2 } from '../dom.js';

/** Episode masthead, laid out as a magazine cover. */
export function renderMasthead(ep) {
  const domain = domainById(ep.domain);
  const n = pad2(ep.number);
  const domainNumber = domain.id.slice(1);

  return html(`
    <header class="masthead">
      <div class="wrap masthead-grid">
        <p class="issue-line pixel">
          <span>Issue ${n}</span><span class="sparkle" aria-hidden="true"></span>
          <span>${esc(ep.issue)}</span><span class="sparkle" aria-hidden="true"></span>
          <span>AWS in 3D</span>
          <span class="issue-exam">${esc(EXAM.code)} · ${esc(domain.short)}</span>
        </p>

        <p class="masthead-number chrome-text" aria-hidden="true">${n}</p>

        <div class="masthead-copy">
          <h1 class="masthead-title">
            <span class="visually-hidden">Episode ${n}: </span>
            ${ep.titleLines.map((line) => `<span class="chrome-text">${esc(line)}</span>`).join(' ')}
          </h1>
          <p class="masthead-deck">${esc(ep.deck)}</p>
        </div>

        <p class="masthead-burst burst" style="--tilt: -12deg">
          <span>
            <span aria-hidden="true">${esc(domain.id)}<small>${domain.weight}% of exam</small></span>
            <span class="visually-hidden">Exam domain ${domainNumber}, ${esc(domain.name)}: ${domain.weight}% of the exam</span>
          </span>
        </p>

        <div class="masthead-meta">
          <p class="barcode" aria-hidden="true"><span class="bars"></span>9 770200 1${n}0${domainNumber}</p>
          <p class="pixel masthead-folio">${esc(domain.id)} · ${esc(domain.name)}</p>
        </div>
      </div>
    </header>
  `);
}
