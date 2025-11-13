import { css, html, LitElement } from "lit";

export class ProjectLink extends LitElement {
    static styles = css`
        :host(:hover) > fyi-jakob-item-lit {
            cursor: pointer;
            background-color: var(--item-background-color-hover);
            border-color: var(--item-border-color-hover);
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { type: Array },
        time: { type: String },
        link: { type: String },
        target: { type: String },
    };

    constructor() {
        super();
        this.target = "_blank";
    }

    openLink() {
        window.open(this.link, this.target);
    }

    render() {
        return html`<fyi-jakob-item-lit @click="${this.openLink}">
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
            <svg
                slot="aside"
                fill="none"
                class="icon"
                height="24"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                />
            </svg>
        </fyi-jakob-item-lit>`;
    }
}
