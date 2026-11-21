import { css, html, LitElement } from "lit";
import { externalLink } from "../shared/icons";
import { asideIconStyles, cardLinkStyles } from "../shared/styles";
import { jsonArray, renderTags } from "../ui/tags";
import { relFor } from "./link-utils";

/** Card that links to an external project page. Rendered as a real <a>. */
export class ProjectLink extends LitElement {
    static styles = [
        asideIconStyles,
        cardLinkStyles,
        css`
            :host {
                display: block;
            }

            :host(:hover) fyi-jakob-item {
                cursor: pointer;
                background-color: var(--item-background-color-hover);
                border-color: var(--item-border-color-hover);
            }
        `
    ];

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { converter: jsonArray },
        time: { type: String },
        link: { type: String },
        target: { type: String }
    };

    constructor() {
        super();
        this.target = "_blank";
    }

    render() {
        return html`<a
            class="card"
            href=${this.link}
            target=${this.target}
            rel=${relFor(this.target)}
        >
            <fyi-jakob-item>
                ${renderTags(this.tags, this.time)}
                <fyi-jakob-titles
                    slot="content"
                    .mainTitle=${this.mainTitle}
                    .subTitle=${this.subTitle}
                ></fyi-jakob-titles>
                <span slot="aside" class="aside-icon">${externalLink}</span>
            </fyi-jakob-item>
        </a>`;
    }
}
