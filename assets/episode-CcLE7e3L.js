const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./stage-DZW7agCU.js","./tokens-DTc4GvIW.js","./three.core-DtjtRha-.js","./prefs-BEnHeuj1.js"])))=>i.map(i=>d[i]);
import{_ as e,a as t,c as n,d as r,f as i,g as a,i as o,l as s,m as c,n as l,o as u,p as d,r as f,s as p,t as m,u as h}from"./ticker-BGy-hPjd.js";import{t as g}from"./preload-helper-BaNbYf_w.js";import{t as _}from"./prefs-BEnHeuj1.js";function v(t){let n=e(t.domain),r=d(t.number),i=n.id.slice(1);return h(`
    <header class="masthead">
      <div class="wrap masthead-grid">
        <p class="issue-line pixel">
          <span>Issue ${r}</span><span class="sparkle" aria-hidden="true"></span>
          <span>${s(t.issue)}</span><span class="sparkle" aria-hidden="true"></span>
          <span>AWS in 3D</span>
          <span class="issue-exam">${s(a.code)} · ${s(n.short)}</span>
        </p>

        <p class="masthead-number chrome-text" aria-hidden="true">${r}</p>

        <div class="masthead-copy">
          <h1 class="masthead-title">
            <span class="visually-hidden">Episode ${r}: </span>
            ${t.titleLines.map(e=>`<span class="chrome-text">${s(e)}</span>`).join(` `)}
          </h1>
          <p class="masthead-deck">${s(t.deck)}</p>
        </div>

        <p class="masthead-burst burst" style="--tilt: -12deg">
          <span>
            <span aria-hidden="true">${s(n.id)}<small>${n.weight}% of exam</small></span>
            <span class="visually-hidden">Exam domain ${i}, ${s(n.name)}: ${n.weight}% of the exam</span>
          </span>
        </p>

        <div class="masthead-meta">
          <p class="barcode" aria-hidden="true"><span class="bars"></span>9 770200 1${r}0${i}</p>
          <p class="pixel masthead-folio">${s(n.id)} · ${s(n.name)}</p>
        </div>
      </div>
    </header>
  `)}var y=`ABCDEFGH`;function b(t,a){let o=e(a),c=h(`
    <section class="quiz wrap" id="quiz" tabindex="-1" aria-labelledby="quiz-title">
      <header class="opener">
        <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Exam prep</p>
        <h2 class="opener-title" id="quiz-title">Admit one</h2>
        <p class="opener-deck">${t.length} exam-style tickets. Pick an answer, check it, and read why.</p>
      </header>
      <ol class="tickets" role="list">${t.map((e,n)=>`
    <li class="ticket-wrap">
      <form class="ticket" data-question="${s(e.id)}" novalidate>
        <div class="ticket-stub" aria-hidden="true">
          <span class="stub-admit pixel">Admit one</span>
          <span class="stub-number">Q${n+1}</span>
          <span class="stamp pixel">${s(o.id)}<span class="stamp-name"><br />${s(o.short)}</span></span>
        </div>
        <fieldset class="ticket-main">
          <legend class="ticket-question">
            <span class="visually-hidden">Question ${n+1} of ${t.length}: </span>${i(e.question)}
          </legend>
          <div class="options">
            ${e.options.map((t,n)=>`
              <label class="option" for="${s(e.id)}-${n}">
                <input type="radio" id="${s(e.id)}-${n}" name="${s(e.id)}" value="${n}" />
                <span class="option-letter" aria-hidden="true">${y[n]}</span>
                <span class="option-text">${i(t.text)}</span>
                <span class="option-mark" data-mark></span>
              </label>`).join(``)}
          </div>
          <div class="ticket-actions">
            <button class="btn btn-primary" type="submit">Check answer</button>
            <p class="ticket-hint" data-hint hidden>Pick an answer first.</p>
          </div>
          <div class="ticket-result" data-result hidden></div>
        </fieldset>
      </form>
    </li>`).join(``)}</ol>
      <p class="quiz-score pixel" data-score hidden></p>
    </section>
  `),l=new Map,d=u(`[data-score]`,c);return p(`.ticket`,c).forEach(e=>{let a=t.find(t=>t.id===e.dataset.question),o=u(`[data-result]`,e),s=u(`[data-hint]`,e);e.addEventListener(`change`,()=>s.hidden=!0),e.addEventListener(`submit`,c=>{c.preventDefault();let f=e.querySelector(`input:checked`);if(!f){s.hidden=!1,n(`Pick an answer first.`);return}let m=Number(f.value),h=a.options[m],g=!!h.correct;if(l.has(a.id)||l.set(a.id,g),p(`.option`,e).forEach((e,t)=>{let n=u(`[data-mark]`,e);delete e.dataset.result,n.innerHTML=``,t===m&&(e.dataset.result=g?`correct`:`wrong`,n.innerHTML=g?`${r.check}<span class="visually-hidden">Correct answer</span>`:`${r.cross}<span class="visually-hidden">Not this one</span>`)}),o.hidden=!1,o.innerHTML=`
        <span class="sticker ${g?`is-ok`:`is-bad`}" style="--tilt: ${g?-4:3}deg">
          ${g?r.check:r.cross} ${g?`Correct`:`Try again`}
        </span>
        <p>${i(h.why)}</p>`,o.toggleAttribute(`data-pop`,!0),requestAnimationFrame(()=>requestAnimationFrame(()=>o.removeAttribute(`data-pop`))),n(`${g?`Correct.`:`Not quite.`} ${h.why}`),l.size===t.length){let e=[...l.values()].filter(Boolean).length;d.hidden=!1,d.textContent=`First-try score: ${e} of ${t.length}`}})}),c}var x=e=>`0:${d(Math.round(e))}`;function S(e,t,n){let r=e.facts?.length?`<dl class="facts">
        ${e.facts.map(e=>`<div class="fact${e.value.length>9?` is-long`:``}">
              <dt>${i(e.value)}</dt><dd>${i(e.label)}</dd>
            </div>`).join(``)}
      </dl>`:``,a=e.console?`<section class="terminal" aria-labelledby="terminal-title">
        <div class="terminal-bar">
          <span class="terminal-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <h4 class="terminal-title" id="terminal-title"><span class="visually-hidden">Console clicks: </span>${s(e.console.title)}</h4>
        </div>
        <ol class="terminal-lines" role="list">
          ${e.console.lines.map(e=>e.path?`<li class="is-path"><span class="mark" aria-hidden="true">▸</span> ${e.path.map(e=>`<span>${s(e)}</span>`).join(`<span class="sep" aria-hidden="true"> › </span>`)}</li>`:`<li class="is-field"><span class="k">${s(e.field)}</span><span class="eq" aria-hidden="true">=</span><span class="v${e.tone?` is-${e.tone}`:``}">${s(e.value)}</span></li>`).join(``)}
        </ol>
        ${e.console.note?`<p class="terminal-note">${i(e.console.note)}</p>`:``}
      </section>`:``;return`
    <header class="panel-head">
      <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Step ${d(t+1)} of ${d(n)} · ${s(e.kicker)}</p>
      <h3 class="panel-title" id="panel-title" tabindex="-1">${s(e.title)}</h3>
    </header>
    <div class="panel-body">${e.body.map(e=>`<p>${i(e)}</p>`).join(``)}</div>
    ${r}
    ${a}
  `}function C(e){let t=e.primary===`healthy`,n=(e,t,n)=>`<li class="hud-chip${n?` is-${n}`:``}"><span class="hud-label">${e}</span> <span class="hud-value">${t}</span></li>`;return[n(`us-east-1`,t?`${r.check} Healthy`:`${r.cross} Unhealthy`,t?`ok`:`bad`),n(`DNS answer`,e.answer===`primary`?`us-east-1`:`us-west-2`,e.answer===`primary`?``:`info`),e.checkers?n(`Failed checks`,`${e.failCount} / 3`,e.failCount>=3?`bad`:e.failCount>0?`warn`:``):``,e.checkers?n(`Alarm`,e.alarm?`In alarm`:`OK`,e.alarm?`bad`:`ok`):``].join(``)}function w(e){let t=e.steps,a=t.length,o=h(`
    <section class="reader wrap" id="reader" tabindex="-1" aria-labelledby="reader-title">
      <h2 class="visually-hidden" id="reader-title">${s(e.title)}, step by step</h2>

      <nav class="rail" aria-label="Steps">
        <p class="rail-head pixel" aria-hidden="true"><span>Playlist</span><span>${a} tracks</span></p>
        <ol role="list">
          ${t.map((e,t)=>`<li>
                <button class="rail-pill" type="button" data-step="${t}">
                  <span class="num" aria-hidden="true">${d(t+1)}</span>
                  <span class="name"><span class="visually-hidden">Step ${t+1}: </span>${s(e.rail)}</span>
                  <span class="time" aria-hidden="true">${x(e.duration)}</span>
                </button>
              </li>`).join(``)}
        </ol>
      </nav>

      <figure class="stage" aria-labelledby="stage-caption">
        <div class="window">
          <div class="window-bar">
            <div class="bubbles">
              <button class="bubble is-ice" type="button" data-reset-view title="Reset view">${r.reset}<span class="visually-hidden">Reset view</span></button>
              <button class="bubble is-chrome" type="button" data-lite-toggle title="Lite mode">${r.bolt}<span class="visually-hidden">Lite mode</span></button>
              <button class="bubble is-brand" type="button" data-fullscreen title="Full screen" hidden>${r.expand}<span class="visually-hidden">Full screen</span></button>
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
            <button class="btn" type="button" data-prev>${r.prev}<span>Prev</span></button>
            <p class="counter pixel" aria-hidden="true"><span data-counter></span></p>
            <button class="btn" type="button" data-replay>${r.replay}<span>Replay</span></button>
            <button class="btn btn-primary" type="button" data-next><span data-next-label>Next</span>${r.next}</button>
          </div>
        </div>
        <figcaption class="stage-caption" id="stage-caption" data-caption></figcaption>
      </figure>

      <article class="step-panel" data-panel aria-labelledby="panel-title"></article>
    </section>
  `),l=u(`.reader`,o),f=p(`.rail-pill`,l),m=u(`[data-panel]`,l),v=u(`[data-caption]`,l),y=u(`[data-scene-title]`,l),b=u(`[data-counter]`,l),w=u(`[data-hud]`,l),T=u(`[data-prev]`,l),E=u(`[data-next]`,l),D=u(`[data-next-label]`,l),O=u(`[data-replay]`,l),k=u(`[data-stage-status]`,l),A=u(`[data-fullscreen]`,l),j=u(`.stage`,l),M=t.findIndex(e=>`#${e.id}`===location.hash),N=Math.max(0,M),P=null,F=e=>{w.innerHTML=C(e)};function I(e){let t=e.closest(`ol`);t.scrollWidth<=t.clientWidth||t.scrollTo({left:e.offsetLeft-(t.clientWidth-e.offsetWidth)/2})}function L(e,{animate:r=!0,focus:o=!1,speak:s=!0,updateHash:l=!0}={}){N=Math.min(Math.max(e,0),a-1);let p=t[N];f.forEach((e,t)=>{t===N?e.setAttribute(`aria-current`,`step`):e.removeAttribute(`aria-current`),t<N&&(e.dataset.played=``)}),I(f[N]),m.innerHTML=S(p,N,a),m.toggleAttribute(`data-entering`,r),requestAnimationFrame(()=>requestAnimationFrame(()=>m.removeAttribute(`data-entering`))),y.textContent=`Scene ${d(N+1)} · ${c(p.rail)}`,v.innerHTML=`<span class="fig pixel">Fig. ${d(N+1)}</span> ${i(p.caption)}`,b.textContent=`Step ${d(N+1)} / ${d(a)}`,T.setAttribute(`aria-disabled`,String(N===0)),D.textContent=N===a-1?`Take the quiz`:`Next`,l&&history.replaceState(null,``,`${location.pathname}${location.search}#${p.id}`),F(p.state),P?.goTo(N,{animate:r}),o&&u(`#panel-title`,m).focus({preventScroll:!0}),s&&n(`Step ${N+1} of ${a}: ${p.title}`)}f.forEach((e,t)=>e.addEventListener(`click`,()=>L(t))),T.addEventListener(`click`,()=>{N>0&&L(N-1)}),E.addEventListener(`click`,()=>{if(N<a-1)return L(N+1);let e=document.getElementById(`quiz`);e?.scrollIntoView({behavior:matchMedia(`(prefers-reduced-motion: reduce)`).matches?`auto`:`smooth`}),e?.focus({preventScroll:!0})}),O.addEventListener(`click`,()=>P?.replay()),l.addEventListener(`keydown`,e=>{e.altKey||e.ctrlKey||e.metaKey||e.target.closest(`input, textarea, select`)||(e.key===`ArrowRight`&&N<a-1?(e.preventDefault(),L(N+1)):e.key===`ArrowLeft`&&N>0&&(e.preventDefault(),L(N-1)))}),_(u(`[data-lite-toggle]`,l)),document.fullscreenEnabled&&(A.hidden=!1,A.addEventListener(`click`,()=>{document.fullscreenElement?document.exitFullscreen():j.requestFullscreen?.()}),document.addEventListener(`fullscreenchange`,()=>A.setAttribute(`aria-pressed`,String(document.fullscreenElement===j))));async function R(){try{let[{createStage:n},r]=await Promise.all([g(()=>import(`./stage-DZW7agCU.js`),__vite__mapDeps([0,1,2,3]),import.meta.url),e.loadScene()]);P=await n({viewport:u(`[data-viewport]`,l),canvas:u(`[data-canvas]`,l),steps:t,scene:r,onState:F}),u(`[data-reset-view]`,l).addEventListener(`click`,()=>P.resetView()),k.hidden=!0,P.goTo(N,{animate:!1})}catch(e){console.warn(`3D stage unavailable:`,e),k.textContent=`3D view unavailable on this device. The caption below describes each scene.`,l.querySelector(`[data-viewport]`).dataset.fallback=``,O.setAttribute(`aria-disabled`,`true`)}}return{element:o,start(){L(N,{animate:!1,speak:!1,updateHash:M>=0}),R()}}}function T(e){let t=(e,t)=>`
    <article class="page is-${e}" aria-labelledby="vs-${e}">
      <p class="pixel page-kicker">${s(t.kicker)}</p>
      <h3 class="page-title" id="vs-${e}">${s(t.name)}</h3>
      <dl class="page-rows">
        ${t.rows.map(([e,t])=>`<div><dt>${s(e)}</dt><dd>${i(t)}</dd></div>`).join(``)}
      </dl>
    </article>`;return h(`
    <section class="versus wrap" id="versus" tabindex="-1" aria-labelledby="versus-title">
      <header class="opener">
        <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Exam trap</p>
        <h2 class="opener-title" id="versus-title">${s(e.title)}</h2>
        <p class="opener-deck">${s(e.deck)}</p>
      </header>
      <div class="spread">
        ${t(`left`,e.left)}
        <div class="vs" aria-hidden="true"><span class="vs-badge"><span class="chrome-text">VS</span></span></div>
        ${t(`right`,e.right)}
      </div>
      <p class="exam-tip"><span class="sticker" style="--tilt: -4deg">Exam tip</span> ${i(e.tip)}</p>
    </section>
  `)}l();var E=u(`[data-episode]`),D=new URLSearchParams(location.search).get(`id`)??o()[0]?.id;if(t[D]){let{default:e}=await t[D]();document.title=`${e.title} | AWS in 3D`,u(`meta[name="description"]`).content=e.deck;let n=w(e);E.append(v(e),m(e.ticker),n.element),e.versus&&E.append(T(e.versus)),e.quiz?.length&&E.append(b(e.quiz,e.domain)),e.sources?.length&&E.append(h(`
        <section class="sources wrap" aria-labelledby="sources-title">
          <h2 class="pixel" id="sources-title">Further reading</h2>
          <ul role="list">
            ${e.sources.map(e=>`<li><a href="${s(e.href)}" rel="noopener">${s(e.title)}</a></li>`).join(``)}
          </ul>
          <p>AWS updates these pages and the exam guide. Check them before exam day.</p>
        </section>
      `)),n.start();let r=location.hash.length>1?document.getElementById(location.hash.slice(1)):null;r?.matches(`section`)&&r.scrollIntoView()}else{let e=f.find(e=>e.id===D);document.title=`${e?`Not out yet`:`Not found`} | AWS in 3D`,E.append(h(`
      <section class="wrap not-found">
        <p class="kicker">${e?`In production`:`Not found`}</p>
        <h1 class="opener-title">${e?`“${s(e.title)}” isn’t out yet`:`There’s no issue by that name`}</h1>
        <p><a href="./#contents">Back to the contents</a></p>
      </section>
    `))}