/**
 * Convierte texto a trazados SVG usando la Cascadia Mono SemiBold que ya trae
 * el proyecto via @fontsource. El SVG resultante no depende de tener la fuente
 * instalada, asi que abre igual en Illustrator, Inkscape, Figma o imprenta.
 *
 * Tambien reproduce el modelo de caja de linea de CSS (`line-height`,
 * `letter-spacing`) para que las posiciones coincidan con lo que pinta el
 * navegador en los componentes Astro.
 */
import * as fontkit from "fontkit";
import { fileURLToPath } from "node:url";

const fontPath = (weight) =>
  fileURLToPath(
    new URL(
      `../../node_modules/@fontsource/cascadia-mono/files/cascadia-mono-latin-${weight}-normal.woff`,
      import.meta.url,
    ),
  );

/**
 * 600 para `.brand` (font-weight: 600) y 400 para todo lo demas, que hereda
 * el peso normal del body. Ambos cortes comparten metricas, asi que solo
 * cambia el trazo.
 */
const FONTS = {
  400: fontkit.openSync(fontPath(400)),
  600: fontkit.openSync(fontPath(600)),
};
export const DEFAULT_WEIGHT = 400;

const font = FONTS[600];
const UPM = font.unitsPerEm;
const ASCENT = font.ascent / UPM;
const DESCENT = font.descent / UPM; // negativo
/** Cascadia Mono: todos los glifos avanzan lo mismo. */
const ADVANCE = font.layout("0").glyphs[0].advanceWidth / UPM;

/**
 * Ancho de una cadena tal y como la mide CSS.
 * `letter-spacing` se suma DESPUES de cada caracter, incluido el ultimo.
 */
export function measure(text, size, trackingEm = 0) {
  return text.length * (size * ADVANCE + size * trackingEm);
}

/**
 * Desplazamiento de la linea base desde el borde superior de la caja de linea.
 * Replica el "half-leading" de CSS: el area de contenido (ascent+descent) se
 * centra dentro de la caja de `line-height`.
 */
export function baseline(size, lineHeight) {
  const contentHeight = (ASCENT - DESCENT) * size;
  return (lineHeight - contentHeight) / 2 + ASCENT * size;
}

function glyphsToPath(text, size, trackingEm, penX, baselineY, weight) {
  const scale = size / UPM;
  const step = size * ADVANCE + size * trackingEm;
  const parts = [];
  let x = penX;

  for (const glyph of FONTS[weight].layout(text).glyphs) {
    const d = glyph.path.scale(scale, -scale).translate(x, baselineY).toSVG();
    if (d) parts.push(d);
    x += step;
  }

  return { d: parts.join(" "), endX: x };
}

/**
 * Convierte tramos de texto con distinto color en trazados.
 * Los tramos comparten una unica pluma, asi que el interletrado entre tramos
 * es el mismo que dentro de ellos (igual que spans dentro de un div en CSS).
 *
 * @param {Array<[string, string]>} runs pares [texto, color]
 * @returns {{ paths: Array<{d: string, fill: string}>, width: number }}
 */
export function runsToPaths(
  runs,
  { size, tracking = 0, x = 0, baseline: y, weight = DEFAULT_WEIGHT },
) {
  const paths = [];
  let pen = x;

  for (const [text, fill] of runs) {
    if (!text) continue;
    const { d, endX } = glyphsToPath(text, size, tracking, pen, y, weight);
    if (d) paths.push({ d, fill });
    pen = endX;
  }

  return { paths, width: pen - x };
}

export const fontInfo = {
  weights: Object.keys(FONTS).map(Number),
  paths: Object.keys(FONTS).map((w) => fontPath(w)),
  family: FONTS[400].familyName,
  unitsPerEm: UPM,
  ascent: ASCENT,
  descent: DESCENT,
  advance: ADVANCE,
};
