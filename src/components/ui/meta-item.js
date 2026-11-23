import { css, html, LitElement } from "lit";

/** Small tag, e.g. "History" or "2025". */
export class MetaItem extends LitElement {
    static styles = css`
        :host {
            display: inline-flex;
            font-size: 0.6em;
            font-weight: 500;
            line-height: 1.4;
            color: var(--tag-text-color);
            padding: 2px 5px;
            border: 2px solid var(--tag-border-color);
            border-radius: 2px;
            width: auto;
            white-space: nowrap;
        }
    `;

    render() {
        return html`<slot></slot>`;
    }
}
