import { css, html, LitElement } from "lit";

export class Link extends LitElement {
    static styles = css`
        :host {
            transition: all ease 300ms;
            .wrapper {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                width: 100%;
                align-items: center;
                justify-content: space-between;

                path {
                    stroke: #aaa;
                }
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
            <fyi-jakob-titles-lit
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles-lit>
            <svg
                fill="none"
                height="24"
                width="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                />
            </svg>
        </div>`;
    }
}
