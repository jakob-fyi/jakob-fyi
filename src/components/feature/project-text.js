import { html, LitElement } from "lit";

export class ProjectText extends LitElement {
    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { type: Array },
        time: { type: String },
    };

    constructor() {
        super();
    }

    render() {
        return html`<fyi-jakob-item-lit>
            ${(this.tags ?? []).map(
                (item) => html`
                    <fyi-jakob-meta-item-lit slot="meta">
                        ${item}
                    </fyi-jakob-meta-item-lit>
                `,
            )}
            <fyi-jakob-meta-item-lit slot="meta">
                ${this.time}
            </fyi-jakob-meta-item-lit>
            <fyi-jakob-titles-lit
                slot="content"
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles-lit>
        </fyi-jakob-item-lit>`;
    }
}
