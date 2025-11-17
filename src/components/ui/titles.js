import { css, html, LitElement } from "lit";

export class Titles extends LitElement {
    static styles = css`
        :host {
            .main-title {
                font-size: 1em;
                line-height: 1.4;
                color: var(--item-title-text-color);
                font-weight: 500;
                margin: 0px;
                padding: 0px;
            }

            .sub-title {
                color: var(--item-subtitle-text-color);
                margin: 0px;
                padding: 0px;
                margin-top: 4px;
                font-size: 0.9em;
            }
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
    };

    constructor() {
        super();
    }

    render() {
        return html`
            <div class="main-title">${this.mainTitle}</div>
            <div class="sub-title">${this.subTitle}</div>
        `;
    }
}
