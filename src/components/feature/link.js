import { css, html, LitElement } from "lit";
import { externalLink } from "../shared/icons";
import { asideIconStyles } from "../shared/styles";
import { relFor } from "./link-utils";

/** Link row in the footer ("Mail & Links"). */
export class Link extends LitElement {
    static styles = [
        asideIconStyles,
        css`
            :host {
                display: block;
            }

            .wrapper {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                width: 100%;
                align-items: center;
                justify-content: space-between;
                color: inherit;
                text-decoration: none;
                transition: opacity ease 300ms;
            }

            .wrapper:hover {
                opacity: 0.65;
            }

            .wrapper:focus-visible {
                outline: 2px solid var(--focus-ring-color);
                outline-offset: 4px;
            }
        `
    ];

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        link: { type: String },
        target: { type: String }
    };

    constructor() {
        super();
        this.target = "_blank";
    }

    render() {
        // mailto: and similar links must not open an empty tab.
        const target = /^https?:/.test(this.link ?? "") ? this.target : "_self";

        return html`<a
            class="wrapper"
            href=${this.link}
            target=${target}
            rel=${relFor(target)}
        >
            <fyi-jakob-titles
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles>
            <span class="aside-icon">${externalLink}</span>
        </a>`;
    }
}
