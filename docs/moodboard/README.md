# Moodboard: "Millennium Issue"

Reference board for the direction. The screenshots themselves are third-party, copyrighted work, so they stay out of this public repo. Save local captures to `docs/moodboard/shots/`, which is git-ignored.

The target is Businessweek-style editorial layouts rendered in Y2K chrome and gloss, with Wrapped-level layering on the home page and episode openers.

## Y2K Futurism: materials and the 3D world

- **Y2K Futurism** (the label comes from CARI, the Consumer Aesthetics Research Institute): liquid-metal 3D, blobby organic shapes, icy blue / silver / glossy white, sharp lime or orange accents. <https://aesthetics.fandom.com/wiki/Y2K_Futurism>
  - Take: the chrome blob on the cover, chrome rings and arches in the scene, the ice-blue sky.
- **Frutiger Aero**, for the glossy UI chrome only: aero glass, gloss, bokeh, lens flare, skeuomorphic buttons. <https://en.wikipedia.org/wiki/Frutiger_Aero>
  - Take: jelly bubble buttons, the gloss highlight on pills and the window title bar.
- **Y2K for the web today**: gloss UI, chunky and pixel type, bubbles and blobs, metallic and neon glows. <https://webflow.com/blog/y2k-aesthetic>
  - Take: Silkscreen for tiny tags only, bloom on packets and alarms only.
- **"Dial-up design" (2026 trend)**: bitmap fonts, collage layouts, deliberately human and a little chaotic. <https://digitalagencybangkok.com/10-viral-website-design-trends-2026/>
  - Take: the energy (stickers, barcode, "no plug-ins required"). Leave out the visitor counters.

## Maximalist and editorial typography

- **PIN-UP magazine**: repetition as a layout device.
- **TAPE** (music venue): type as image.
- **One & All festival**: bold contrast. <https://www.awwwards.com/inspiration/hero-typeface-one-all>
- **Glitché**: neon layering.
- Overview: <https://webflow.com/blog/maximalism-web-design>

## Also studied

- **Bloomberg Businessweek covers**: editorial maximalism in print. Take: the giant number, cover lines, stickers over type.
- **Spotify Wrapped**: maximal interactive storytelling. Take: layering and one big moment per screen.
- **The Pudding**: editorial data storytelling done right. Take: a calm reading column beside the visual, captions that explain the figure.
- **Charli XCX "Brat"**: proof the acid-lime look reaches the mainstream. Take: lime as a rare, loud pop.

## How the board maps to the build

| Reference | Where it shows up |
|---|---|
| Liquid chrome, ice light | `cover-blob.js`, `MeshPhysicalMaterial` chrome in the stage, tinted `RoomEnvironment` |
| Aero gloss | `.btn::before` gloss, `.bubble`, `.window-bar`, `.rail-pill` |
| Holo foil | Current rail track, the `SOA-C03 ready` sticker (one per screen) |
| Editorial grid | Masthead, section openers, folios, `Fig. 01` captions, pull-quote facts |
| Maximal layering | Cover stickers, starbursts, barcode, ticker, rotated trading cards |
| Calm core | `.step-panel`, `.terminal`, `.ticket`: solid surfaces and a 62ch measure |
