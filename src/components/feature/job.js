import { css, html, LitElement } from "lit";
import { relFor } from "./link-utils";

/** Employer/organisation entry in the footer. Links if `link` is set. */
export class Job extends LitElement {
    static styles = css`
        :host {
            display: block;
        }

        .wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.5em;
            width: 100%;
            align-items: flex-start;
            color: inherit;
            text-decoration: none;
            transition: opacity ease 300ms;
        }

        a.wrapper:hover {
            opacity: 0.65;
        }

        a.wrapper:focus-visible {
            outline: 2px solid var(--focus-ring-color);
            outline-offset: 4px;
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tagline: { type: String },
        link: { type: String },
        target: { type: String }
    };

    constructor() {
        super();
        this.target = "_blank";
    }

    render() {
        const content = html`<fyi-jakob-meta-item
                >${this.tagline}</fyi-jakob-meta-item
            >
            <fyi-jakob-titles
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles>`;

        return this.link
            ? html`<a
                  class="wrapper"
                  href=${this.link}
                  target=${this.target}
                  rel=${relFor(this.target)}
                  >${content}</a
              >`
            : html`<div class="wrapper">${content}</div>`;
    }
}
