# Design system: "Millennium Issue"

The site is a printed tech magazine from the year 2000 that came alive.

- **Y2K Futurism** for materials and the 3D world.
- **Editorial** for structure.
- **Maximalism** for density and layering.

**The rule:** a maximal frame around a calm reading core. The excess lives in the masthead, section openers, the stage frame, the rail and the home page. The step narration, console clicks and quiz always sit on solid, high-contrast panels with a 62ch measure.

All tokens live in [`src/styles/tokens.css`](../src/styles/tokens.css). Components never use raw colors.

---

## Color

Tier 1 is the palette, tier 2 is semantic roles, and tier 3 is component tokens (`--scene-*`, `--console-*`, `--ticker-*`).

| Role | Light | Dark | Use |
|---|---|---|---|
| Bordeaux (brand) | `#613132` | `#613132` bg, `#E7A39B` as text | Masthead, primary buttons, rail current step |
| Chrome | `#F4F4F6 → #A9ADB8 → #FFFFFF → #8C909C` | `#B9BCC6 → #5C606C → #D6D8DF → #444852` | Display type, bevels, window frames |
| Brushed chrome | `#FFF → #ECEEF2 → #CFD2DA` | `#646873 → #4E525C → #3B3E47` | Controls that carry text (narrow luminance band, so text holds AA) |
| Holo foil | `#FFB3D9 → #C9B6FF → #B8F1FF → #CFFFE4` | `#C98AAB → #9D8BD6 → #86BFCC → #93C7A9` | One per screen: rail current track, cover sticker |
| Ice blue | `#BFE3FF` | `#6FAADB` | Glows, focus ring (dark), traffic in the scene |
| Acid lime | `#C6FF3D` | `#C6FF3D` | Rare pop only: NEW stickers, exam-domain badges, exam tip |
| Paper / ink | `#F3EFEA` (+ grain) / `#1B1113` | `#120A0B` / `#F4ECEB` | Reading surfaces |
| Panel | `#FDFBF8` | `#1C1213` | The calm core |

**Status colors are separate from decoration.** `--ok`, `--warn`, `--bad` and `--info` only ever signal state, always with an icon or text alongside, and never borrow a decorative color.

**Chrome display type** sits on bordeaux in both themes and keeps the light gradient steps. Its darkest stop (`#8C909C`) is 3.3:1 on `#613132`, which passes AA for large text. It's only used at 28px and up.

### Light and dark

- Light is the default. Dark applies when the OS prefers dark (and the reader hasn't pinned light), or when the reader pins dark.
- The toggle has two states: follow the system, or pin the opposite. It sets `data-theme` and the `<meta name="color-scheme">`, stores the choice, and an inline head script applies it before first paint.
- The dark block appears twice in `tokens.css`, once under the media query and once under `[data-theme="dark"]`. `npm run check:contrast` fails if the two drift.
- `forced-colors` maps tokens to system colors, and decorative fills drop out.

### Contrast

`npm run check:contrast` resolves both themes and checks 51 pairs against WCAG 2.2 AA, including text on each holo stop, brushed chrome stops, terminal colors, sticker colors, focus rings and control borders. Add a pair whenever a component puts text on a new background.

## Type

| Family | Role | Where |
|---|---|---|
| **Unbounded** (variable) | Y2K display | Masthead, episode titles, card titles, VS, stub numbers. Chrome fill at large sizes. |
| **Instrument Serif** | Editorial | Decks, pull-quote facts, drop caps, section openers, cover lines (italic) |
| **IBM Plex Sans** | Body | Narration, options, captions, buttons |
| **IBM Plex Mono** | Data | Console clicks, kickers, ticker values |
| **Silkscreen** | Tiny tags only | Folios, stickers, HUD, issue lines, stamps |

Fonts are Google Fonts, self-hosted through Fontsource and bundled by Vite. Every family has a system fallback stack, and body text uses `font-size-adjust: from-font`.

**Scale:** 12 / 14 / 16 / 20 / 28 / 40 / 64 / 112 px (`--fs-12` … `--fs-112`). Fluid sizes only interpolate between two neighbouring steps (`--fs-display`, `--fs-title`, `--fs-headline`, `--fs-deck`).

**No more than three families in one block:**

| Block | Families |
|---|---|
| Masthead | Unbounded, Instrument Serif, Silkscreen |
| Step panel | Plex Mono, Instrument Serif, Plex Sans |
| Stage window | Unbounded, Silkscreen, Plex Sans |
| Versus spread | Silkscreen, Unbounded, Plex Sans |
| Quiz ticket | Silkscreen, Unbounded, Plex Sans |
| Cover | Unbounded, Instrument Serif, Silkscreen |
| Trading card | Unbounded, Instrument Serif, Silkscreen |

## Components

| Component | Notes |
|---|---|
| **Masthead** | Issue line, giant chrome number, chrome title, serif-italic deck, lime starburst with the exam domain and weight, barcode, folio. Halftone over bordeaux. |
| **Ticker** | Key numbers on ink. Pauses on hover and focus, has a visible pause button (WCAG 2.2.2), and with reduced motion doesn't move at all: one copy wraps and the button goes. |
| **Stage window** | A Y2K OS window: chrome frame, glossy title bar, three jelly bubble buttons (reset view, Lite mode, full screen; real buttons with icons and names), brushed-chrome toolbar (Prev, Replay, Next), `Fig. NN` caption. |
| **HUD** | Status chips over the scene on solid panels: Region health, DNS answer, failed checks, alarm. Each chip pairs color with a text value and an icon. |
| **Rail** | A playlist of chunky glossy pills with a track number and clip length. The current step is bordeaux gel with a holo number and sheen; played tracks get a check. It becomes a horizontal strip below 84rem. |
| **Step panel** | Kicker, serif headline, drop cap on the first paragraph, facts as pull quotes (`<dl>`), and console clicks in a beveled terminal (always dark). |
| **Versus spread** | Two magazine pages with a fold shadow and a chrome **VS** on a bordeaux badge in the gutter. They stack on mobile. |
| **Quiz ticket** | Perforated stub with notches, an "Admit one" strip, a rubber stamp with a grain mask, native radios, then a CORRECT or TRY AGAIN sticker plus the reason for the chosen option. |
| **Cover** | Chrome logo, live liquid-chrome blob (with a CSS sphere fallback), serif cover lines, a starburst, holo and chrome stickers, a barcode. |
| **Trading cards** | Rotated ±2°. Live cards tilt toward the pointer with a glare. Planned cards show the card back, quieter, with an "In production" stamp. |
| **Coverage strip** | Segment width equals the exam weight. Covered domains are bordeaux, uncovered ones hatched. Screen readers get the full text. |
| **Ornaments** | Grain (SVG noise data URI) on paper, halftone on bordeaux, a four-point sparkle masked to `currentColor`, a 24-point starburst `clip-path`. |

Cascade layers, in order: `reset, tokens, base, layout, components, utilities`. Visual primitives (`.chrome-text`, `.holo`, `.sparkle`, `.pixel`, `.kicker`) live in `base` so components can tailor them. `utilities` is only for things that must win (`.visually-hidden`, `.skip-link`, `.wrap`).

## 3D stage (three.js)

| Piece | How |
|---|---|
| Environment | `RoomEnvironment` through `PMREMGenerator`, plus two token-colored light panels (ice and pink, or ice and lilac in dark) so chrome reflects Y2K light. |
| Chrome | `MeshPhysicalMaterial`, metalness 1, roughness 0.08: ALB arches, the Route 53 ring, servers (satin). |
| Iridescence | Packets, ALB gate films, health-checker orbs, the Route 53 globe, the cover blob. |
| Clearcoat | Region plates, user monitors, record cards. |
| Bloom | Selective `UnrealBloomPass`: only materials flagged `userData.bloom` (packets, LEDs, the alarm) glow; everything else renders black into the bloom pass. Off in Lite mode. |
| Sky | Canvas gradient from `--scene-sky-*`: ice to lilac in light, bordeaux to black in dark. |
| Floor | A chrome plate with mirrored reflections in overview shots, and a grid floor in close-ups (tweened). |
| Labels | `CSS2DRenderer` nameplates, styled by CSS tokens and `aria-hidden` (the caption carries the meaning). Detail labels hide in wide shots. Record-card text is printed on the card in the page fonts. |
| Theming | Every scene color comes from a CSS token. `retheme()` runs on `themechange`: it re-reads tokens, rebinds materials, repaints the sky, shadows and cards, and rebuilds the environment. |
| Lite mode | No bloom, no reflections, pixel ratio 1. Automatically on for reduced motion, ≤4 cores, ≤4 GB memory, Save-Data, or a software GPU (SwiftShader, llvmpipe). The reader can override it either way, and the choice is remembered. |
| Performance | three.js loads after the text renders. The scene renders on demand: the loop stops when nothing moves, when the stage is off screen, or when the tab is hidden. |
| No WebGL | The stage shows a note and the reader works as before: captions describe every scene. |

### Clips

Each step is a short clip (8 s by default) that plays once and holds. Nothing loops.

```js
{
  state:  { shot, primary, answer, failCount, alarm, checkers, records, focus }, // where the step ends
  beats:  [{ at: 2.1, set: { failCount: 1 } }],     // timed state changes
  flows:  [{ route: 'primary', every: 0.55, from: 0.9, fate: 'drop' },
           { pings: 'fail', every: 1.3 }],          // packets while the clip plays
}
```

The clip starts from the previous step's values for whatever the beats change. With reduced motion the stage cuts straight to `state` and shows the flows active at mid-clip as still packets along their trails.

A scene module (`episodes/<id>.scene.js`) exports `buildScene(kit)` and returns `{ actors, overlay, shots, route, pings, showRoutes, applyState, update, setShot, retheme }`. `actors` is mirrored for the floor reflection; `overlay` (labels, trails, shadows, focus rings) isn't.

## Motion

- **One orchestrated moment per page:** on load, a chrome sheen sweeps the masthead and the stickers pop with a spring (`linear()` easing). On the cover, the blob pours in.
- **Micro-interactions:** button gloss slides on hover, pills nudge, cards tilt toward the pointer, the blob turns toward the mouse and settles.
- **No autoplay loops** except the ticker, which is pausable. Step clips end and hold.
- **Reduced motion:** no sheen, pop, tilt, ticker movement, camera flights or packet motion. Lite mode turns on.

## Accessibility

- Landmarks, a skip link, a sequential heading outline, and a page title per episode.
- Every interactive element is a native `<button>`, `<a>` or `<input>` with a visible `:focus-visible` ring (3px, 3:1 or better against its surface) and a target of at least 24px (44px on coarse pointers).
- Step changes are announced through one polite live region. ← / → step through the episode when focus is in the reader. A step's URL hash is shareable (`#records`).
- Quiz results mark the chosen option with an icon and hidden text, not color alone, and the explanation is announced.
- The canvas is `role="img"` and points to the caption. HUD values are text.
- `prefers-reduced-motion`, `prefers-color-scheme` and `forced-colors` are all honored.
