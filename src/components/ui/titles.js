import { css, html, LitElement } from "lit";

export class Titles extends LitElement {
    static styles = css`
        .main-title {
            font-size: 1em;
            line-height: 1.4;
            color: var(--item-title-text-color);
            font-weight: 500;
            margin: 0;
            padding: 0;
        }

        .sub-title {
            color: var(--item-subtitle-text-color);
            margin: 4px 0 0;
            padding: 0;
            font-size: 0.9em;
        }

        .sub-title:empty {
            display: none;
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String }
    };

    render() {
        return html`<div class="main-title">${this.mainTitle}</div>
            <div class="sub-title">${this.subTitle ?? ""}</div>`;
    }
}
