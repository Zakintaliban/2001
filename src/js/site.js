/** Shared shell for every page: fonts, styles, top bar tools, colophon. */
import '@fontsource-variable/unbounded/wght.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/400-italic.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/silkscreen/400.css';
import '../styles/main.css';

import { $, html, icons } from './dom.js';
import { bindLiteToggle } from './prefs.js';
import { bindThemeToggle } from './theme.js';

export function mountShell() {
  const tools = $('[data-tools]');
  if (tools) {
    tools.append(
      html(`
        <button class="btn btn-quiet btn-small" type="button" data-lite-toggle>
          ${icons.bolt}<span class="label">Lite mode</span>
        </button>
        <button class="btn btn-quiet btn-small" type="button" data-theme-toggle>
          ${icons.moon}<span class="label">Dark mode</span>
        </button>
      `),
    );
    bindLiteToggle($('[data-lite-toggle]', tools));
    bindThemeToggle($('[data-theme-toggle]', tools));
  }

  const colophon = $('[data-colophon]');
  if (colophon) {
    colophon.append(
      html(`
        <div class="wrap">
          <p class="folio pixel"><span class="sparkle" aria-hidden="true"></span> AWS in 3D · The Millennium Issue · Vol. 1</p>
          <p>Set in Unbounded, Instrument Serif, IBM Plex Sans, IBM Plex Mono and Silkscreen. Scenes rendered live with three.js.</p>
          <p>An independent study project, not affiliated with or endorsed by Amazon Web Services. AWS and Amazon Route 53 are trademarks of Amazon.com, Inc. or its affiliates.</p>
        </div>
      `),
    );
  }
}
