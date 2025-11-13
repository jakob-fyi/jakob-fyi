import { css, html, LitElement } from "lit";

export class ProjectEvent extends LitElement {
    static styles = css`
        :host(:hover) > fyi-jakob-item-lit {
            cursor: pointer;
            background-color: var(--item-background-color-hover);
            border-color: var(--item-border-color-hover);
        }

        :host {
            .expanded-content {
                height: auto;
                overflow: hidden;
                max-height: 0;

                &.active {
                    animation-name: showexpanded;
                    animation-duration: 300ms;
                    max-height: 1000px;
                }

                &.inactive {
                    animation-name: hideexpanded;
                    animation-duration: 300ms;
                    max-height: 0;
                }
            }
        }

        @keyframes showexpanded {
            from {
                max-height: 0px;
                opacity: 0;
            }
            to {
                max-height: 1000px;
                opacity: 1;
            }
        }

        @keyframes hideexpanded {
            from {
                max-height: 1000px;
                opacity: 1;
            }
            to {
                max-height: 0px;
                opacity: 0;
            }
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { type: Array },
        date: { type: String },
        time: { type: String },
        place: { type: String },
        expanded: { type: Boolean },
    };

    constructor() {
        super();
    }

    toggle() {
        this.expanded = !this.expanded;
    }

    render() {
        return html`<fyi-jakob-item-lit @click="${this.toggle}">
            ${(this.tags ?? []).map(
                (item) => html`
                    <fyi-jakob-meta-item-lit slot="meta">
                        ${item}
                    </fyi-jakob-meta-item-lit>
                `,
            )}
            <fyi-jakob-titles-lit
                slot="content"
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles-lit>
            <div>
                <p class="datetime">${this.date} | ${this.time}</p>
                <p class="place">${this.place}</p>
            </div>

            <div
                class="expanded-content ${this.expanded
                    ? "active"
                    : "inactive"}"
            >
                <slot></slot>
            </div>
        </fyi-jakob-item-lit>`;
    }
}
