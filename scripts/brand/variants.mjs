/**
 * Geometria de los logos, traducida desde los componentes Astro de
 * src/components/logo/ al modelo de caja de CSS (padding, gap, line-height,
 * letter-spacing, align-items).
 *
 * Los colores y espaciados vienen de styles.css via tokens.mjs. Lo que se
 * define aqui es solo la ESTRUCTURA; si tocas el layout de un componente
 * .astro, este archivo es el que hay que actualizar.
 */
import { t, px } from "./tokens.mjs";
import { measure, baseline, runsToPaths } from "./text.mjs";
import * as S from "./svg.mjs";

/* ------------------------------------------------------------------ */
/* Decisiones que el CSS deja abiertas y un SVG tiene que fijar        */
/* ------------------------------------------------------------------ */
export const CONFIG = {
  /**
   * PortraitLogo usa `clamp(--fs-h1, 14cqw, --fs-display-xl)` para la marca,
   * asi que su tamano depende del ancho del contenedor. Un SVG exportado
   * necesita un ancho concreto: por debajo de 280px el propio componente
   * oculta el prompt y el meta, asi que 320 es el ancho minimo "completo".
   */
  portraitWidth: 520,

  /**
   * SmallLogo pone `container-type: unset`, asi que el `4cqw` de
   * `.square-body` cae al viewport pequeno y en escritorio se resuelve al
   * tope del clamp. Fijamos ese tope (--space-5) para que el export sea
   * estable y no dependa del ancho de la ventana.
   */
  smallBodyPadding: px("--space-5"),

  /**
   * `.dim` (el `~` del prompt) no esta definido en styles.css, asi que hoy
   * hereda el color del texto. Aqui se atenua a proposito. Ponlo en
   * t('--surface-1') si prefieres que el SVG replique el bug tal cual.
   */
  promptDimColor: t("--ink-3"),

  /**
   * El tercer punto usa --ink-2 sobre fondo --ink: a 12px se lee, pero en un
   * favicon de 16px desaparece. Para la marca (mark.svg) se sube a --ink-3.
   */
  markThirdDot: t("--ink-3"),
};

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */
const BG = t("--ink");
const LINE = t("--ink-2");
const META = t("--ink-3");
const TEXT = t("--surface-1");
const BLUE = t("--brand-blue-700");
const ORANGE = t("--brand-orange-700");

const BORDER = 1; // .term { border: 1px solid var(--ink-2) }
const RADIUS = px("--radius-2");

const SP1 = px("--space-1");
const SP2 = px("--space-2");
const SP3 = px("--space-3");
const SP4 = px("--space-4");
const SP5 = px("--space-5");

const MICRO = px("--fs-micro");
const MICRO_LH = MICRO * px("--lh-micro");

const SMALL = px("--fs-small");
const SMALL_LH = SMALL * px("--lh-small");

/* ------------------------------------------------------------------ */
/* Piezas compartidas                                                  */
/* ------------------------------------------------------------------ */
const BRAND_RUNS = [
  ["5", BLUE],
  ["0", ORANGE],
  ["5", BLUE],
  ["12", ORANGE],
  [".", ORANGE],
  ["dev", TEXT],
];
const BRAND_TEXT = BRAND_RUNS.map(([s]) => s).join("");

/** `.brand { font-weight: 600 }`. Todo lo demas hereda el 400 del body. */
const BRAND_WEIGHT = 600;

const brandWidth = (size, trackingEm) => measure(BRAND_TEXT, size, trackingEm);

const DOT = 12;
const DOT_GAP = 6;

const STATUS_DOT = 6;
const STATUS_TEXT = "READY";
const STATUS_BOX_H = MICRO; // .status { line-height: 1 }

/** Alto de la barra sin contar su borde inferior. */
const BAR_H = SP2 * 2 + DOT; // los puntos (12px) siempre mandan sobre el status (11px)

/** Barra superior: 3 puntos a la izquierda, status opcional a la derecha. */
function bar({ x, y, width, showStatus }) {
  const nodes = [];
  const rowTop = y + SP2;
  const cy = rowTop + DOT / 2;

  for (let i = 0; i < 3; i++) {
    nodes.push(
      S.circle({
        cx: x + SP3 + DOT / 2 + i * (DOT + DOT_GAP),
        cy,
        r: DOT / 2,
        fill: [BLUE, ORANGE, LINE][i],
      }),
    );
  }

  if (showStatus) {
    const textW = measure(STATUS_TEXT, MICRO, px("--tr-micro"));
    const boxRight = x + width - SP3;
    const boxLeft = boxRight - (STATUS_DOT + SP1 + textW);
    const boxTop = rowTop + (DOT - STATUS_BOX_H) / 2;

    nodes.push(
      S.circle({
        cx: boxLeft + STATUS_DOT / 2,
        cy,
        r: STATUS_DOT / 2,
        fill: ORANGE,
        filter: "url(#glow)",
      }),
      S.circle({
        cx: boxLeft + STATUS_DOT / 2,
        cy,
        r: STATUS_DOT / 2,
        fill: ORANGE,
      }),
    );

    const { paths } = runsToPaths([[STATUS_TEXT, META]], {
      size: MICRO,
      tracking: px("--tr-micro"),
      x: boxLeft + STATUS_DOT + SP1,
      baseline: boxTop + baseline(MICRO, STATUS_BOX_H),
    });
    nodes.push(...paths.map(S.path));
  }

  // border-bottom de .term-bar
  nodes.push(S.rect({ x, y: y + BAR_H, width, height: BORDER, fill: LINE }));

  return nodes;
}

/** Marco de la terminal: borde + fondo. `overflow: hidden` no hace falta. */
function frame(width, height) {
  return [
    S.rect({ x: 0, y: 0, width, height, rx: RADIUS, fill: LINE }),
    S.rect({
      x: BORDER,
      y: BORDER,
      width: width - BORDER * 2,
      height: height - BORDER * 2,
      rx: Math.max(RADIUS - BORDER, 0),
      fill: BG,
    }),
  ];
}

/** Una linea de texto `.micro` (mono, 11px, uppercase, tracking 0.12em). */
function microLine(text, { x, top, fill = META }) {
  const { paths } = runsToPaths([[text.toUpperCase(), fill]], {
    size: MICRO,
    tracking: px("--tr-micro"),
    x,
    baseline: top + baseline(MICRO, MICRO_LH),
  });
  return paths.map(S.path);
}

const microWidth = (text) =>
  measure(text.toUpperCase(), MICRO, px("--tr-micro"));

const GLOW = S.glowFilter("glow", 6); // box-shadow: 0 0 6px

/**
 * Devuelve el SVG junto a las metricas de layout. brand-check.astro las
 * compara contra `getBoundingClientRect()` del componente real para detectar
 * si el CSS y este archivo se han desincronizado.
 */
const doc = (name, { width, height, body, showStatus, brand }) => ({
  metrics: { width, height, barHeight: BAR_H, brand },
  svg: S.document({
    width,
    height,
    title: `50512.dev — logo ${name}`,
    desc: "Generado por scripts/build-brand.mjs. Texto convertido a trazados.",
    defs: showStatus ? [GLOW] : [],
    body: [...frame(width, height), ...body],
  }),
});

/* ------------------------------------------------------------------ */
/* BannerLogo                                                          */
/* ------------------------------------------------------------------ */
function banner({
  tag = "developer",
  role = "engineer",
  showStatus = true,
} = {}) {
  const size = px("--fs-display-lg");
  const trackingEm = px("--tr-display-lg");
  const brandW = brandWidth(size, trackingEm);
  const brandLH = size * px("--lh-display-lg");

  const sideLines = [`// ${tag}`, `// ${role}`];
  const sideW = Math.max(...sideLines.map(microWidth));
  const sideH = MICRO_LH * 2 + SP1;

  // .term-body.small { flex-direction: row; gap: --space-4; padding: --space-4 --space-5 }
  const sidePadLeft = SP4; // .side { padding-left: var(--space-4) }

  const bodyH = SP4 * 2 + Math.max(brandLH, sideH);
  const bodyW = SP5 * 2 + brandW + SP4 + sidePadLeft + sideW;

  // Se redondea hacia arriba: a ancho exacto el navegador parte la linea de
  // `.side` por redondeo subpixel.
  const width = Math.ceil(bodyW + BORDER * 2);
  const height = Math.ceil(BORDER + BAR_H + BORDER + bodyH + BORDER);

  const bodyTop = BORDER + BAR_H + BORDER;
  const contentTop = bodyTop + SP4;
  const contentH = Math.max(brandLH, sideH);

  const brandTop = contentTop + (contentH - brandLH) / 2;
  const brandX = BORDER + SP5;
  const { paths: brandPaths } = runsToPaths(BRAND_RUNS, {
    size,
    weight: BRAND_WEIGHT,
    tracking: trackingEm,
    x: brandX,
    baseline: brandTop + baseline(size, brandLH),
  });

  const sideX = BORDER + SP5 + brandW + SP4 + sidePadLeft;
  const sideTop = contentTop + (contentH - sideH) / 2; // align-self: center

  return doc("banner", {
    width,
    height,
    showStatus,
    brand: { x: brandX, y: brandTop, width: brandW, height: brandLH },
    body: [
      ...bar({ x: BORDER, y: BORDER, width: width - BORDER * 2, showStatus }),
      ...brandPaths.map(S.path),
      ...microLine(sideLines[0], { x: sideX, top: sideTop }),
      ...microLine(sideLines[1], { x: sideX, top: sideTop + MICRO_LH + SP1 }),
    ],
  });
}

/* ------------------------------------------------------------------ */
/* PortraitLogo                                                        */
/* ------------------------------------------------------------------ */
function portrait({
  tag = "developer",
  version = "v5.05.12",
  showPrompt = true,
  showMeta = true,
  showStatus = true,
  width = CONFIG.portraitWidth,
} = {}) {
  const inner = width - BORDER * 2;

  // .portrait-brand { font-size: clamp(--fs-h1, 14cqw, --fs-display-xl) }
  const size = Math.min(
    Math.max(px("--fs-h1"), inner * 0.14),
    px("--fs-display-xl"),
  );
  const trackingEm = px("--tr-display-lg"); // .brand
  const brandLH = size * px("--lh-display-lg");

  const promptH = showPrompt ? SMALL_LH : 0;
  const brandBlockH = SP1 + brandLH + SP1; // margin: --space-1 0
  const metaH = showMeta ? SP1 + SP1 + MICRO_LH : 0; // margin-top + padding-top + linea

  const bodyH = SP4 * 2 + promptH + brandBlockH + metaH;
  const height = Math.ceil(BORDER + BAR_H + BORDER + bodyH + BORDER);

  const contentX = BORDER + SP5;
  const contentW = inner - SP5 * 2;
  let cursor = BORDER + BAR_H + BORDER + SP4;

  const body = [...bar({ x: BORDER, y: BORDER, width: inner, showStatus })];

  if (showPrompt) {
    const { paths } = runsToPaths(
      [
        ["~", CONFIG.promptDimColor],
        [" ", TEXT],
        ["$", ORANGE],
        [" whoami", TEXT],
      ],
      {
        size: SMALL,
        x: contentX,
        baseline: cursor + baseline(SMALL, SMALL_LH),
      },
    );
    body.push(...paths.map(S.path));
    cursor += SMALL_LH;
  }

  cursor += SP1;
  const brandTop = cursor;
  const { paths: brandPaths } = runsToPaths(BRAND_RUNS, {
    size,
    weight: BRAND_WEIGHT,
    tracking: trackingEm,
    x: contentX,
    baseline: cursor + baseline(size, brandLH),
  });
  body.push(...brandPaths.map(S.path));
  cursor += brandLH + SP1;

  if (showMeta) {
    const metaTop = cursor + SP1 + SP1;
    body.push(
      ...microLine(`// ${tag}`, { x: contentX, top: metaTop }),
      ...microLine(version, {
        x: contentX + contentW - microWidth(version),
        top: metaTop,
      }),
    );
  }

  return doc("portrait", {
    width,
    height,
    showStatus,
    // .portrait-brand es display:block -> ocupa todo el ancho de contenido
    brand: { x: contentX, y: brandTop, width: contentW, height: brandLH },
    body,
  });
}

/* ------------------------------------------------------------------ */
/* SquareLogo / SmallLogo                                              */
/* ------------------------------------------------------------------ */
function squareBrandPaths({ frameW, bodyTop, bodyH, pad }) {
  const size = px("--fs-display");
  const trackingEm = px("--tr-display");
  const brandW = brandWidth(size, trackingEm);
  const brandLH = size * px("--lh-display");

  const boxX = BORDER + pad;
  const boxW = frameW - BORDER * 2 - pad * 2;
  const boxY = bodyTop + pad;
  const boxH = bodyH - pad * 2;

  const brandX = boxX + (boxW - brandW) / 2; // justify-content: center
  const brandY = boxY + (boxH - brandLH) / 2; // align-items: center

  const { paths } = runsToPaths(BRAND_RUNS, {
    size,
    weight: BRAND_WEIGHT,
    tracking: trackingEm,
    x: brandX,
    baseline: brandY + baseline(size, brandLH),
  });

  return {
    paths,
    brand: { x: brandX, y: brandY, width: brandW, height: brandLH },
  };
}

function square({ showStatus = false, size: frameSize = 200 } = {}) {
  const inner = frameSize - BORDER * 2;
  const bodyTop = BORDER + BAR_H + BORDER;
  const bodyH = frameSize - bodyTop - BORDER;

  // .square-body { padding: clamp(--space-3, 4cqw, --space-5) }
  const pad = Math.min(Math.max(SP3, inner * 0.04), SP5);

  const { paths, brand } = squareBrandPaths({
    frameW: frameSize,
    bodyTop,
    bodyH,
    pad,
  });

  return doc("square", {
    width: frameSize,
    height: frameSize,
    showStatus,
    brand,
    body: [
      ...bar({ x: BORDER, y: BORDER, width: inner, showStatus }),
      ...paths.map(S.path),
    ],
  });
}

function small({ showStatus = false } = {}) {
  const pad = CONFIG.smallBodyPadding;
  const size = px("--fs-display");
  const brandW = brandWidth(size, px("--tr-display"));
  const brandLH = size * px("--lh-display");

  // Ceil antes de centrar, para que el centrado use la caja definitiva.
  const width = Math.ceil(brandW + pad * 2 + BORDER * 2);
  const bodyH = Math.ceil(brandLH + pad * 2);
  const bodyTop = BORDER + BAR_H + BORDER;
  const height = bodyTop + bodyH + BORDER;

  const { paths, brand } = squareBrandPaths({
    frameW: width,
    bodyTop,
    bodyH,
    pad,
  });

  return doc("small", {
    width,
    height,
    showStatus,
    brand,
    body: [
      ...bar({ x: BORDER, y: BORDER, width: width - BORDER * 2, showStatus }),
      ...paths.map(S.path),
    ],
  });
}

/* ------------------------------------------------------------------ */
/* Marca reducida (favicon)                                            */
/* ------------------------------------------------------------------ */
/**
 * A 16px el texto "50512.dev" es ilegible, asi que el favicon usa el motivo
 * distintivo del logo -- los tres puntos de la barra -- sobre el cuadrado ink.
 */
function mark({ size = 256 } = {}) {
  const d = size * 0.1875; // 48 @256
  const gap = size * 0.09375; // 24 @256
  const total = d * 3 + gap * 2;
  const x0 = (size - total) / 2;
  const cy = size / 2;

  const dots = [BLUE, ORANGE, CONFIG.markThirdDot].map((fill, i) =>
    S.circle({ cx: x0 + d / 2 + i * (d + gap), cy, r: d / 2, fill }),
  );

  return {
    metrics: { width: size, height: size },
    svg: S.document({
      width: size,
      height: size,
      title: "50512.dev — marca",
      desc: "Generado por scripts/build-brand.mjs.",
      body: [
        S.rect({
          x: 0,
          y: 0,
          width: size,
          height: size,
          rx: size * 0.09375,
          fill: BG,
        }),
        ...dots,
      ],
    }),
  };
}

/* ------------------------------------------------------------------ */
export const VARIANTS = {
  banner: () => banner(),
  portrait: () => portrait(),
  square: () => square(),
  "square-status": () => square({ showStatus: true }),
  small: () => small(),
  "small-status": () => small({ showStatus: true }),
  mark: () => mark(),
};

export { banner, portrait, square, small, mark };
