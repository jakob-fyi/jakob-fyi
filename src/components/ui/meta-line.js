import { css, html, LitElement } from "lit";

export class MetaLine extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
            gap: 10px;
            flex-wrap: wrap;
        }
    `;

    static properties = {
        items: { type: Array },
        time: { type: String },
    };

    constructor() {
        super();
    }

    render() {
        return html`
            ${(this.items ?? []).map(
                (item) => html`
                    <fyi-jakob-meta-item-lit> ${item} </fyi-jakob-meta-item-lit>
                `,
            )}
            <fyi-jakob-meta-item-lit>${this.time}</fyi-jakob-meta-item-lit>
        `;
    }
}
