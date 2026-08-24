/** Rasterizado a PNG (resvg) y empaquetado ICO. */
import { Resvg } from '@resvg/resvg-js';

/**
 * Rasteriza un SVG a PNG. Como el texto ya son trazados, resvg no necesita
 * resolver ninguna fuente.
 */
export function toPng(svg, { width }) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: Math.round(width) } });
  return resvg.render().asPng();
}

/**
 * Empaqueta varios PNG cuadrados en un .ico.
 * Formato: ICONDIR (6 bytes) + N x ICONDIRENTRY (16 bytes) + payloads PNG.
 */
export function toIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // 1 = icono
  header.writeUInt16LE(count, 4);

  const directory = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  images.forEach(({ size, png }, i) => {
    const e = i * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, e + 0); // 0 significa 256
    directory.writeUInt8(size >= 256 ? 0 : size, e + 1);
    directory.writeUInt8(0, e + 2); // paleta
    directory.writeUInt8(0, e + 3); // reservado
    directory.writeUInt16LE(1, e + 4); // planos
    directory.writeUInt16LE(32, e + 6); // bits por pixel
    directory.writeUInt32LE(png.length, e + 8);
    directory.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });

  return Buffer.concat([header, directory, ...images.map((i) => i.png)]);
}
