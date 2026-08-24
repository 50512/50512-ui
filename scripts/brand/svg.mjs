/** Serializacion minima de SVG. Sin dependencias, salida legible y diffeable. */

/** Redondea a 3 decimales y quita el `.0` sobrante. */
const n = (v) => {
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
};

const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? n(v) : v}"`)
    .join('');

export const rect = (o) => `<rect${attrs(o)}/>`;
export const circle = (o) => `<circle${attrs(o)}/>`;
export const path = (o) => `<path${attrs(o)}/>`;

/**
 * Filtro que imita `box-shadow: 0 0 <blur>px <color>`.
 * CSS define el blur como el diametro del difuminado, SVG usa la desviacion
 * estandar: de ahi el /2.
 */
export const glowFilter = (id, blurPx) =>
  `<filter id="${id}" x="-100%" y="-100%" width="300%" height="300%">` +
  `<feGaussianBlur stdDeviation="${n(blurPx / 2)}"/>` +
  `</filter>`;

export function document({ width, height, title, desc, defs = [], body }) {
  const nodes = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${n(width)}" height="${n(height)}" viewBox="0 0 ${n(width)} ${n(height)}" role="img" aria-label="${title}">`,
    `  <title>${title}</title>`,
    desc ? `  <desc>${desc}</desc>` : null,
    defs.length ? `  <defs>${defs.join('')}</defs>` : null,
    ...body.filter(Boolean).map((line) => `  ${line}`),
    '</svg>',
  ];

  return `${nodes.filter(Boolean).join('\n')}\n`;
}

export { n as num };
