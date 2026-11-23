import { defineComponents } from "../src/components/lit-components.js";

defineComponents();

/**
 * Renders `markup` into the body and waits until every Lit element has rendered.
 *
 * The markup is parsed into a detached container first and then moved into
 * the document, so elements already have their children when
 * `connectedCallback` runs - as in a browser. (happy-dom's `body.innerHTML`
 * connects custom elements before appending their children.)
 */
export const mount = async (markup) => {
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.replaceChildren(...container.childNodes);
    await settle();
    return document.body.firstElementChild;
};

/** Waits for all pending Lit updates (including nested elements) to finish. */
export const settle = async () => {
    for (let round = 0; round < 3; round++) {
        const elements = [...document.querySelectorAll("*")].filter(
            (el) => el.updateComplete
        );
        await Promise.all(elements.map((el) => el.updateComplete));
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
};

export const shadow = (el, selector) => el.shadowRoot.querySelector(selector);

/**
 * Dispatches a click on `target` whose composed path starts at `origin`.
 * happy-dom does not propagate events from slotted light-DOM nodes into the
 * shadow tree, so this simulates a click on a slotted element as it arrives
 * at a listener inside the shadow root.
 */
export const clickFrom = (origin, target) => {
    const event = new MouseEvent("click", { bubbles: true, composed: true });
    const path = [];
    for (let node = origin; node; node = node.parentNode ?? node.host)
        path.push(node);
    Object.defineProperty(event, "composedPath", { value: () => path });
    target.dispatchEvent(event);
};

/** Builds detached `fyi-jakob-section` elements for the pure summary helpers. */
export const sections = (markup) => {
    const template = document.createElement("template");
    template.innerHTML = markup;
    return [...template.content.children];
};
