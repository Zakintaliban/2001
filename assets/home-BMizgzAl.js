const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./cover-blob-s0XXHk47.js","./tokens-DTc4GvIW.js","./three.core-DtjtRha-.js","./prefs-BEnHeuj1.js"])))=>i.map(i=>d[i]);
import{g as e,h as t,l as n,n as r,o as i,p as a,r as o,s,t as c,u as l}from"./ticker-BGy-hPjd.js";import{t as u}from"./preload-helper-BaNbYf_w.js";import{i as d}from"./prefs-BEnHeuj1.js";r();var f=i(`[data-home]`),p=o.find(e=>e.status===`live`),m=`episode.html?id=${encodeURIComponent(p.id)}`,h=[-1.6,1.2,-.7,1.9,-1.1,.6];f.append(l(`
    <section class="cover" aria-labelledby="cover-title">
      <div class="wrap cover-grid">
        <p class="issue-line pixel">
          <span>The Millennium Issue</span><span class="sparkle" aria-hidden="true"></span>
          <span>Vol. 1 · Issue ${a(p.number)}</span><span class="sparkle" aria-hidden="true"></span>
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
            <a href="${m}">
              <span class="pixel">Cover story · p. ${a(p.number)}</span>
              <strong>Failover in ninety seconds</strong>
              <span class="cover-sub">${n(p.deck)}</span>
            </a>
          </li>
          <li>
            <a href="${m}#versus">
              <span class="pixel">The showdown</span>
              <strong>Route 53 vs. ELB health checks</strong>
              <span class="cover-sub">Two checks, two jobs. The exam loves to swap them.</span>
            </a>
          </li>
          <li>
            <a href="${m}#quiz">
              <span class="pixel">Exam prep</span>
              <strong>Three tickets to the exam</strong>
              <span class="cover-sub">Questions with the reasoning behind every option.</span>
            </a>
          </li>
        </ul>

        <div class="cover-side">
          <p class="burst" style="--tilt: 9deg"><span>New!<small>Issue ${a(p.number)}</small></span></p>
          <p class="sticker is-holo" style="--tilt: -6deg">${n(e.code)} ready</p>
          <p class="sticker cover-chrome" style="--tilt: 4deg">Real-time 3D inside</p>
          <p class="barcode" aria-hidden="true"><span class="bars"></span>9 770200 100107</p>
        </div>
      </div>
    </section>
  `)),f.append(c([`Exam topics as 3D episodes`,`Built for ${e.code}`,`Runs in your browser`,`No plug-ins, no dial-up`,`Now showing: ${p.title}`,`Step through, then take the quiz`],{heading:`Also in this issue`}));var g=t.map(e=>({...e,episodes:o.filter(t=>t.domain===e.id)})),_=g.map(e=>{let t=e.episodes.filter(e=>e.status===`live`).length,r=e.episodes.length-t;return`
      <li class="${t?`is-covered`:``}" style="--w: ${e.weight}">
        <span class="cov-id" aria-hidden="true">${e.id}</span>
        <span class="cov-weight" aria-hidden="true">${e.weight}%</span>
        <span class="visually-hidden">${e.id}, ${n(e.name)}: ${e.weight}% of the exam. ${t} live, ${r} planned.</span>
        <span class="cov-count" aria-hidden="true">${t} live · ${r} soon</span>
      </li>`}).join(``),v=0,y=e=>{let t=h[v++%h.length],r=e.status===`live`,i=`episode.html?id=${encodeURIComponent(e.id)}`;return`
    <li class="card-slot" style="--tilt: ${t}deg">
      <article class="card ${r?`is-live`:`is-planned`}" aria-labelledby="card-${n(e.id)}">
        <div class="card-art" aria-hidden="true">
          <span class="card-number ${r?`chrome-text`:``}">${a(e.number)}</span>
          <span class="sparkle"></span><span class="sparkle"></span>
        </div>
        <div class="card-body">
          <p class="card-folio pixel">Issue ${a(e.number)} · ${n(e.domain)}</p>
          <h4 class="card-title" id="card-${n(e.id)}">
            ${r?`<a href="${i}">${n(e.title)}</a>`:n(e.title)}
          </h4>
          <p class="card-deck">${n(e.deck)}</p>
          <p class="card-services pixel">${e.services.map(n).join(` · `)}</p>
        </div>
        ${r&&e.isNew?`<span class="sticker card-sticker" style="--tilt: 8deg">New</span>`:``}
        ${r?``:`<span class="stamp pixel card-stamp">In production</span>`}
      </article>
    </li>`};if(f.append(l(`
    <section class="contents wrap" id="contents" tabindex="-1" aria-labelledby="contents-title">
      <header class="opener">
        <p class="kicker"><span class="sparkle" aria-hidden="true"></span> Table of contents</p>
        <h2 class="opener-title" id="contents-title">In this issue</h2>
        <p class="opener-deck">Episodes are filed by ${n(e.code)} exam domain. The strip shows how much of the exam each domain is worth, and how much of it we cover so far.</p>
      </header>

      <figure class="coverage">
        <figcaption class="pixel">Exam coverage · ${n(e.code)}</figcaption>
        <ol class="coverage-bar" role="list">${_}</ol>
      </figure>

      <div class="toc">
        ${g.map(e=>`
          <section class="toc-domain" aria-labelledby="toc-${e.id}">
            <h3 class="toc-head" id="toc-${e.id}">
              <span class="toc-id">${e.id}</span>
              <span class="toc-name">${n(e.name)}</span>
              <span class="toc-weight pixel">${e.weight}% of exam</span>
            </h3>
            <ul class="cards" role="list">${e.episodes.map(y).join(``)}</ul>
          </section>`).join(``)}
      </div>
    </section>
  `)),matchMedia(`(pointer: fine)`).matches)for(let e of s(`.card.is-live`))e.addEventListener(`pointermove`,t=>{if(d())return;let n=e.getBoundingClientRect(),r=(t.clientX-n.left)/n.width,i=(t.clientY-n.top)/n.height;e.style.setProperty(`--ry`,`${(r-.5)*10}deg`),e.style.setProperty(`--rx`,`${(.5-i)*8}deg`),e.style.setProperty(`--mx`,`${r*100}%`),e.style.setProperty(`--my`,`${i*100}%`)}),e.addEventListener(`pointerleave`,()=>{for(let t of[`--rx`,`--ry`,`--mx`,`--my`])e.style.removeProperty(t)});u(async()=>{let{mountBlob:e}=await import(`./cover-blob-s0XXHk47.js`);return{mountBlob:e}},__vite__mapDeps([0,1,2,3]),import.meta.url).then(({mountBlob:e})=>e(i(`[data-cover-art]`))).catch(e=>console.warn(`Cover art unavailable:`,e));