import { css, html, LitElement } from "lit";

/**
 * Two-column row: right-aligned title (150px) + content grid.
 * Content columns are configurable via `--content-columns`.
 */
export class Section extends LitElement {
    static styles = css`
        :host {
            --content-column-gap: var(--default-padding);
            --content-row-gap: var(--default-padding);
            --content-columns: 1;

            display: grid;
            grid-template-columns: 150px minmax(0, 1fr);
            gap: calc(2 * var(--default-padding));
            width: 100%;
            max-width: var(--inner-wrapper-width);
        }

        .title {
            grid-column: 1 / span 1;
            align-self: start;
            position: sticky;
            top: 16px;
            color: var(--section-title-text-color);
            font-size: 1em;
            font-weight: var(--font-weight-medium);
            text-align: right;
            padding-top: 15px;
            margin: 0;
            border-top: 1px solid var(--section-title-border-color);
        }

        .title.empty {
            opacity: 0;
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

        @media screen and (max-width: 600px) {
            :host {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            .title {
                position: static;
                text-align: left;
                padding-bottom: 1em;
                padding-top: 2em;
                border-top: 0;
            }

            .content {
                grid-template-columns: minmax(0, 1fr) !important;
            }
        }
    `;

    static properties = {
        mainTitle: { type: String }
    };

    render() {
        return html`${
                this.mainTitle
                    ? html`<h2 class="title" part="title">
                          ${this.mainTitle}
                      </h2>`
                    : html`<div
                          class="title empty"
                          part="title empty-title"
                          aria-hidden="true"
                      ></div>`
            }
            <div class="content"><slot></slot></div>`;
    }
}
