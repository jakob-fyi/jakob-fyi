import { css, html, LitElement } from "lit";

export class Job extends LitElement {
    static styles = css`
        :host {
            transition: all ease 300ms;
            .wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.5em;
                width: 100%;
                align-items: flex-start;
            }
        }

        :host([link]:hover) {
            cursor: pointer;
            opacity: 0.65;
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tagline: { type: String },
        link: { type: String },
        target: { type: String },
    };

    constructor() {
        super();
        this.target = "_blank";
    }

    openLink() {
        if (this.link) {
            window.open(this.link, this.target);
        }
    }

    render() {
        return html`<div class="wrapper" @click="${this.openLink}">
            <fyi-jakob-meta-item> ${this.tagline} </fyi-jakob-meta-item>
            <fyi-jakob-titles
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles>
        </div>`;
    }
}
