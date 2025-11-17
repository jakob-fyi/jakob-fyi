import { css, html, LitElement } from "lit";

export class ProjectEvent extends LitElement {
    static styles = css`
        :host(:hover) > fyi-jakob-item-lit {
            cursor: pointer;
            background-color: var(--item-background-color-hover);
            border-color: var(--item-border-color-hover);
        }

        :host {
            --expanding-top: 14px;

            .datetime,
            .place {
                margin: 0px;
                padding: 0px;
                font-size: 1em;

                &.datetime {
                    color: var(--event-date-and-place-text-color);
                    margin-top: 14px;
                }

                &.place {
                    color: var(--event-date-and-place-text-color);
                    margin-top: 4px;
                }
            }

            .expanded-content {
                height: auto;
                overflow: hidden;
                max-height: 0;

                ::slotted(*:first-child) {
                    transition: all ease 300ms;
                    padding-top: var(--expanding-top) !important;
                }

                &.active {
                    animation-name: showexpanded;
                    animation-duration: 300ms;
                    max-height: 1000px;
                }

                &.inactive {
                    animation-name: hideexpanded;
                    animation-duration: 300ms;
                    max-height: 0;

                    ::slotted(*:first-child) {
                        padding-top: 0 !important;
                    }
                }
            }
        }

        @keyframes showexpanded {
            from {
                max-height: 0px;
                opacity: 0;

                ::slotted(*:first-child) {
                    padding-top: 0px;
                }
            }
            to {
                max-height: 1000px;
                opacity: 1;

                ::slotted(*:first-child) {
                    padding-top: var(--expanding-top);
                }
            }
        }

        @keyframes hideexpanded {
            from {
                max-height: 1000px;
                opacity: 1;

                ::slotted(*:first-child) {
                    padding-top: var(--expanding-top);
                }
            }
            to {
                max-height: 0px;
                opacity: 0;
                padding-top: 0px;

                ::slotted(*:first-child) {
                    padding-top: 0px;
                }
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
        this.expanded = false;
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
            <svg
                slot="aside"
                fill="none"
                class="icon"
                width="26px"
                height="26px"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M136 208l120-104 120 104M136 304l120 104 120-104"
                    fill="none"
                    stroke-width="40"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
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
