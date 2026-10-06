import { domainById } from '../data/domains.js';
import { $, $$, announce, esc, html, icons, md } from '../dom.js';

const LETTERS = 'ABCDEFGH';

/** Exam-ticket quiz: perforated stub, domain stamp, sticker on reveal. */
export function renderQuiz(questions, domainId) {
  const domain = domainById(domainId);

  const ticket = (q, i) => `
    <li class="ticket-wrap">
      <form class="ticket" data-question="${esc(q.id)}" novalidate>
        <div class="ticket-stub" aria-hidden="true">
          <span class="stub-admit pixel">Admit one</span>
          <span class="stub-number">Q${i + 1}</span>
          <span class="stamp pixel">${esc(domain.id)}<span class="stamp-name"><br />${esc(domain.short)}</span></span>
        </div>
        <fieldset class="ticket-main">
          <legend class="ticket-question">
            <span class="visually-hidden">Question ${i + 1} of ${questions.length}: </span>${md(q.question)}
          </legend>
          <div class="options">
            ${q.options
              .map(
                (o, k) => `
              <label class="option" for="${esc(q.id)}-${k}">
                <input type="radio" id="${esc(q.id)}-${k}" name="${esc(q.id)}" value="${k}" />
                <span class="option-letter" aria-hidden="true">${LETTERS[k]}</span>
                <span class="option-text">${md(o.text)}</span>
                <span class="option-mark" data-mark></span>
              </label>`,
              )
              .join('')}
          </div>
          <div class="ticket-actions">
            <button class="btn btn-primary" type="submit">Check answer</button>
            <p class="ticket-hint" data-hint hidden>Pick an answer first.</p>
          </div>
          <div class="ticket-result" data-result hidden></div>
        </fieldset>
      </form>
    </li>`;

  const frag = html(`
    <section class="quiz wrap" id="quiz" tabindex="-1" aria-labelledby="quiz-title">
      <header class="opener">
        <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Exam prep</p>
        <h2 class="opener-title" id="quiz-title">Admit one</h2>
        <p class="opener-deck">${questions.length} exam-style tickets. Pick an answer, check it, and read why.</p>
      </header>
      <ol class="tickets" role="list">${questions.map(ticket).join('')}</ol>
      <p class="quiz-score pixel" data-score hidden></p>
    </section>
  `);

  const firstTry = new Map();
  const score = $('[data-score]', frag);

  $$('.ticket', frag).forEach((form) => {
    const q = questions.find((x) => x.id === form.dataset.question);
    const result = $('[data-result]', form);
    const hint = $('[data-hint]', form);

    form.addEventListener('change', () => (hint.hidden = true));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const picked = form.querySelector('input:checked');
      if (!picked) {
        hint.hidden = false;
        announce('Pick an answer first.');
        return;
      }

      const chosen = Number(picked.value);
      const option = q.options[chosen];
      const correct = Boolean(option.correct);
      if (!firstTry.has(q.id)) firstTry.set(q.id, correct);

      $$('.option', form).forEach((label, k) => {
        const mark = $('[data-mark]', label);
        delete label.dataset.result;
        mark.innerHTML = '';
        if (k === chosen) {
          label.dataset.result = correct ? 'correct' : 'wrong';
          mark.innerHTML = correct
            ? `${icons.check}<span class="visually-hidden">Correct answer</span>`
            : `${icons.cross}<span class="visually-hidden">Not this one</span>`;
        }
      });

      result.hidden = false;
      result.innerHTML = `
        <span class="sticker ${correct ? 'is-ok' : 'is-bad'}" style="--tilt: ${correct ? -4 : 3}deg">
          ${correct ? icons.check : icons.cross} ${correct ? 'Correct' : 'Try again'}
        </span>
        <p>${md(option.why)}</p>`;
      result.toggleAttribute('data-pop', true);
      requestAnimationFrame(() => requestAnimationFrame(() => result.removeAttribute('data-pop')));

      announce(`${correct ? 'Correct.' : 'Not quite.'} ${option.why}`);

      if (firstTry.size === questions.length) {
        const right = [...firstTry.values()].filter(Boolean).length;
        score.hidden = false;
        score.textContent = `First-try score: ${right} of ${questions.length}`;
      }
    });
  });

  return frag;
}
