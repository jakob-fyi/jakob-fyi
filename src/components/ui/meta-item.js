import { css, html, LitElement } from "lit";

export class MetaItem extends LitElement {
    static styles = css`
        :host {
            display: inline-flex;
            font-size: 0.6em;
            font-weight: 500;
            color: var(--tag-text-color);
            padding: 2px 5px;
            border: 2px solid var(--tag-border-color);
            width: auto;
            border-radius: 2px;
        }
    `;

    constructor() {
        super();
    }

    render() {
        return html`<slot></slot>`;
    }
}
