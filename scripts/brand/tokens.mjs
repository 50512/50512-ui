/**
 * Lee los custom properties de `:root` en src/styles/styles.css y los resuelve.
 *
 * La idea es que los colores y espaciados NO se dupliquen aqui: si cambias
 * styles.css, el generador de marca los recoge en la siguiente ejecucion.
 * Lo unico que vive en el generador es la geometria (ver variants.mjs).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CSS_PATH = fileURLToPath(
  new URL("../../src/styles/styles.css", import.meta.url),
);

function parseRoot(css) {
  const block = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error(`No se encontro el bloque :root en ${CSS_PATH}`);

  const raw = {};
  // Quita comentarios /* ... */ antes de partir por declaraciones.
  for (const decl of block[1].replace(/\/\*[\s\S]*?\*\//g, "").split(";")) {
    const m = decl.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (m) raw[m[1]] = m[2].replace(/\s+/g, " ");
  }
  return raw;
}

function resolve(raw) {
  const out = {};
  const seen = new Set();

  const expand = (name) => {
    if (name in out) return out[name];
    if (seen.has(name)) throw new Error(`Referencia circular en ${name}`);
    if (!(name in raw)) throw new Error(`Token no definido: ${name}`);
    seen.add(name);
    out[name] = raw[name].replace(/var\(\s*(--[\w-]+)\s*\)/g, (_, ref) =>
      expand(ref),
    );
    seen.delete(name);
    return out[name];
  };

  for (const name of Object.keys(raw)) expand(name);
  return out;
}

const tokens = resolve(parseRoot(readFileSync(CSS_PATH, "utf8")));

/** Valor crudo del token, ya resuelto (sin `var()`). */
export function t(name) {
  const v = tokens[name];
  if (v === undefined) throw new Error(`Token no definido: ${name}`);
  return v;
}

/** Token numerico en px (`--space-4` -> 16). */
export function px(name) {
  const v = t(name);
  const n = Number.parseFloat(v);
  if (Number.isNaN(n)) throw new Error(`El token ${name} no es numerico: ${v}`);
  return n;
}

/** Token de tracking en em (`--tr-display-lg` -> -0.015). */
export const em = px;

export { tokens, CSS_PATH };
