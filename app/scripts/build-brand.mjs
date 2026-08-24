#!/usr/bin/env node
/**
 * Genera los assets de marca de 50512.dev a partir de los tokens de
 * src/styles/styles.css y la geometria descrita en scripts/brand/variants.mjs.
 *
 *   pnpm run brand
 *
 * Salida:
 *   public/brand/svg/*.svg     vectorial, texto en trazados, sin dependencias
 *   public/brand/png/*.png     1x / 2x / 4x
 *   public/favicon.ico         16/32/48 desde la marca reducida
 *   public/apple-touch-icon.png
 *   public/brand/preview.html  hoja de contacto para revisar el resultado
 */
import { mkdirSync, writeFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

import { VARIANTS } from './brand/variants.mjs';
import { toPng, toIco } from './brand/raster.mjs';
import { CSS_PATH } from './brand/tokens.mjs';
import { fontInfo } from './brand/text.mjs';

const APP = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(APP, 'public');
const BRAND = join(PUBLIC, 'brand');

const PNG_SCALES = [1, 2, 4];
const FAVICON_SIZES = [16, 32, 48];
const APPLE_TOUCH_SIZE = 180;

const written = [];

function write(path, data) {
  writeFileSync(path, data);
  written.push({ path, bytes: data.length });
}

/**
 * Vacia un directorio sin borrarlo: el dev server de Vite deja de servir
 * public/ si se elimina y recrea un subdirectorio que ya estaba vigilando.
 */
function emptyDir(dir) {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    const target = join(dir, entry);
    if (statSync(target).isFile()) rmSync(target);
  }
}

/* ------------------------------------------------------------------ */
emptyDir(BRAND);
emptyDir(join(BRAND, 'svg'));
emptyDir(join(BRAND, 'png'));

const built = {};
const metrics = {};

for (const [name, build] of Object.entries(VARIANTS)) {
  const result = build();
  built[name] = result.svg;
  metrics[name] = result.metrics;

  write(join(BRAND, 'svg', `${name}.svg`), result.svg);

  for (const scale of PNG_SCALES) {
    write(
      join(BRAND, 'png', `${name}@${scale}x.png`),
      toPng(result.svg, { width: result.metrics.width * scale }),
    );
  }
}

/* Metricas de layout, para que /brand-check detecte desincronizaciones */
write(join(BRAND, 'metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);

/* Favicon e icono de aplicacion, desde la marca reducida ------------- */
write(join(PUBLIC, 'favicon.svg'), built.mark);
write(
  join(PUBLIC, 'favicon.ico'),
  toIco(FAVICON_SIZES.map((size) => ({ size, png: toPng(built.mark, { width: size }) }))),
);
write(join(PUBLIC, 'apple-touch-icon.png'), toPng(built.mark, { width: APPLE_TOUCH_SIZE }));

/* Hoja de contacto --------------------------------------------------- */
const preview = `<!doctype html>
<html lang="es-419">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>50512.dev — assets de marca</title>
<style>
  body { margin:0; padding:32px; background:#e9ecef; color:#1a1f24;
         font:16px/1.55 system-ui, sans-serif; }
  h1 { font-size:22px; margin:0 0 4px; }
  p.lead { color:#6b747d; margin:0 0 32px; font-size:14px; }
  section { margin-bottom:32px; }
  h2 { font-size:11px; letter-spacing:.12em; text-transform:uppercase;
       color:#6b747d; margin:0 0 12px; font-family:ui-monospace, monospace; }
  .row { display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start; }
  figure { margin:0; }
  figcaption { font:11px/1.35 ui-monospace, monospace; color:#6b747d;
               margin-top:8px; letter-spacing:.06em; }
  .checker { background-image:
      linear-gradient(45deg,#c5ccd3 25%,transparent 25%),
      linear-gradient(-45deg,#c5ccd3 25%,transparent 25%),
      linear-gradient(45deg,transparent 75%,#c5ccd3 75%),
      linear-gradient(-45deg,transparent 75%,#c5ccd3 75%);
    background-size:16px 16px;
    background-position:0 0,0 8px,8px -8px,-8px 0; padding:16px; }
</style>
</head>
<body>
<h1>50512.dev — assets de marca</h1>
<p class="lead">Generado por <code>scripts/build-brand.mjs</code>. No editar a mano.</p>

<section>
  <h2>SVG (tamano intrinseco)</h2>
  <div class="row checker">
${Object.keys(built)
  .map(
    (n) =>
      `    <figure><img src="svg/${n}.svg" alt="${n}"><figcaption>${n}.svg</figcaption></figure>`,
  )
  .join('\n')}
  </div>
</section>

<section>
  <h2>Favicon a tamano real</h2>
  <div class="row" style="align-items:center">
${FAVICON_SIZES.map(
  (s) =>
    `    <figure><img src="png/mark@1x.png" width="${s}" height="${s}" alt="${s}px"><figcaption>${s}px</figcaption></figure>`,
).join('\n')}
  </div>
</section>
</body>
</html>
`;
write(join(BRAND, 'preview.html'), preview);

/* Resumen ------------------------------------------------------------ */
const kb = (b) => `${(b / 1024).toFixed(1)} kB`;
console.log(`tokens : ${relative(APP, CSS_PATH)}`);
console.log(`fuente : ${fontInfo.family} — pesos ${fontInfo.weights.join(', ')}`);
console.log('');
for (const { path, bytes } of written) {
  console.log(`  ${relative(APP, path).padEnd(38)} ${kb(bytes).padStart(9)}`);
}
console.log(`\n${written.length} archivos generados.`);
