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
        return html`<fyi-jakob-item>
            ${(this.tags ?? []).map(
                (item) => html`
                    <fyi-jakob-meta-item slot="meta">
                        ${item}
                    </fyi-jakob-meta-item>
                `,
            )}
            <fyi-jakob-meta-item slot="meta">
                ${this.time}
            </fyi-jakob-meta-item>
            <fyi-jakob-titles
                slot="content"
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles>
        </fyi-jakob-item>`;
    }
}
