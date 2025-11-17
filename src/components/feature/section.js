import { css, html, LitElement } from "lit";

export class Section extends LitElement {
    static styles = css`
        :host {
            --content-column-gap: var(--default-padding);
            --content-row-gap: var(--default-padding);
            --content-columns: 1;

            display: grid;
            grid-template-columns: 150px auto;
            gap: calc(2 * var(--default-padding));
            width: 100%;
            max-width: var(--inner-wrapper-width);

            .title {
                grid-column-start: 1;
                grid-column-end: span 1;
                color: var(--section-title-text-color);
                font-size: 1em;
                font-weight: var(--font-weight-medium);
                text-align: right;
                padding-top: 15px;
                margin: 0;
                border-top: 1px solid var(--section-title-border-color);

                &:empty {
                    opacity: 0;
                }
            }

            .content {
                grid-column-start: 2;
                display: grid;
                grid-template-columns: repeat(
                    var(--content-columns),
                    minmax(0, 1fr)
                );
                row-gap: var(--content-row-gap);
                column-gap: var(--content-column-gap);
            }
        }

        @media screen and (max-width: 600px) {
            :host {
                display: flex;
                flex-direction: column;
                gap: 0;

                .title {
                    text-align: left;
                    padding-bottom: 1em;
                    padding-top: 2em;
                    border-top: 0;
                }

                .content {
                    grid-template-columns: minmax(0, 1fr) !important;
                }
            }
        }
    `;

    static properties = {
        mainTitle: { type: String },
    };

    constructor() {
        super();
    }

    render() {
        return html` <h2 class="title">${this.mainTitle}</h2>
            <div class="content">
                <slot></slot>
            </div>`;
    }
}
