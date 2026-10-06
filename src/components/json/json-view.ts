type Primitive = string | number | boolean | null;

/**
 * Crea una etiqueta `tag` con la clase(s) `cls` y el texto `text`
 */
function mkElement<Tags extends keyof HTMLElementTagNameMap>(
  tag: Tags,
  cls: string,
  text?: string,
) {
  const ele = document.createElement(tag);
  ele.className = cls;
  if (text !== undefined) ele.textContent = text;
  return ele;
}

/**
 * Crea el nodo JSON en base al key, value, profundidad actual (para objetos anidados),
 * si es el último nodo (para omitir la coma final) y la profundidad de colapso (para
 * crear o no colapsado el nodo).
 */
function renderNode(
  value: unknown,
  key: string | null,
  depth: number,
  last: boolean,
  collapseDepth: number,
): HTMLElement {
  const comma = last ? "" : ",";

  // Si existe key, se crea el elemento correspondiente
  const keyPart = () =>
    key === null
      ? []
      : [
          mkElement("span", "j-key", JSON.stringify(key)),
          document.createTextNode(": "),
        ];

  if (value !== null && typeof value === "object") {
    // Valor es otro objeto
    const isArr = Array.isArray(value);
    const entries = isArr
      ? (value as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(value);
    const [open, close] = isArr ? ["[", "]"] : ["{", "}"];
    const bracket = `json-bracket d${depth % 3}`;

    if (entries.length === 0) {
      const line = mkElement("div", "json-line");
      line.append(
        ...keyPart(),
        mkElement("span", bracket, open + close),
        comma,
      );
      return line;
    }

    const details = mkElement("details", "json-node");
    details.open = depth < collapseDepth; // Abre si profundidad actual es menor a profundidad de colapso
    const summary = mkElement("summary", "json-line");
    summary.append(
      ...keyPart(),
      mkElement("span", bracket, open),
      mkElement(
        "span",
        "json-preview",
        `…${close}${comma} // ${entries.length}`,
      ),
    );
    const kids = mkElement("div", "json-children");
    entries.forEach(([k, v], i) =>
      kids.append(
        renderNode(
          v,
          isArr ? null : k,
          depth + 1,
          i === entries.length - 1,
          collapseDepth,
        ),
      ),
    );
    const end = mkElement("div", "json-line");
    end.append(mkElement("span", bracket, close), comma);
    details.append(summary, kids, end);
    return details;
  }

  const typeValue = value === null ? "null" : typeof (value as Primitive);
  const line = mkElement("div", "json-line");
  line.append(
    ...keyPart(),
    mkElement("span", `json-${typeValue}`, JSON.stringify(value)),
    comma,
  );
  return line;
}

/**
 * Elemento visor de JSON
 */
export class JsonViewElement extends HTMLElement {
  static observedAttributes = ["data-json", "data-collapse-depth"];
  #data: unknown = undefined;

  get data() {
    return this.#data;
  }
  set data(value: unknown) {
    this.#data = value;
    this.render();
  }

  /**
   * Si no hay profundidad de colapso, devuelve Infinity (nada colapsa).
   */
  get collapseDepth() {
    const n = Number(this.dataset.collapseDepth);
    return this.dataset.collapseDepth && Number.isFinite(n) ? n : Infinity;
  }

  /**
   * Re-asigna la prop data si se asigno antes de crearla (para no tapar el setter).
   */
  connectedCallback() {
    if (Object.hasOwn(this, "data")) {
      const value = (this as any).data;
      delete (this as any).data;
      this.data = value;
      return;
    }
    this.render();
  }

  /**
   * Ejecuta en cambio de atributos observados. Vuelve a renderizar en cada cambio
   */
  attributeChangedCallback(
    name: string,
    _old: string | null,
    val: string | null,
  ) {
    if (name === "data-json" && val !== null) {
      try {
        this.#data = JSON.parse(val);
      } catch (err) {
        console.error("json-view: data-json inválido", err);
      }
    }
    if (this.isConnected) this.render();
  }

  /**
   * Reemplaza los hijos por el renderNode.
   */
  render() {
    if (this.#data === undefined) return this.replaceChildren();
    this.replaceChildren(
      renderNode(this.#data, null, 0, true, this.collapseDepth),
    );
  }
}

// Guarda para evitar re-definir el elemento.
if (!customElements.get("json-view"))
  customElements.define("json-view", JsonViewElement);

declare global {
  interface HTMLElementTagNameMap {
    "json-view": JsonViewElement;
  }
}
