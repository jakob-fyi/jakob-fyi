import { css, html, LitElement, nothing } from "lit";
import { chevronUpDown } from "../shared/icons";
import { buttonStyles, collapseStyles } from "../shared/styles";
import { jsonArray, renderTags } from "../ui/tags";

let nextId = 0;

/**
 * Event card (lecture, exhibition). Clicking the card or its toggle button
 * reveals the slotted details.
 */
export class ProjectEvent extends LitElement {
    static styles = [
        buttonStyles,
        collapseStyles,
        css`
            :host {
                display: block;
            }

            :host(:hover) fyi-jakob-item {
                cursor: pointer;
                background-color: var(--item-background-color-hover);
                border-color: var(--item-border-color-hover);
            }

            .datetime,
            .place {
                margin: 0;
                padding: 0;
                font-size: 1em;
                color: var(--event-date-and-place-text-color);
            }

            .datetime {
                margin-top: 14px;
            }

            .place {
                margin-top: 4px;
            }

            .details {
                padding-top: 14px;
            }

            .toggle {
                margin-right: -10px;
            }

            .toggle svg {
                transition: transform 300ms ease;
            }

            :host([expanded]) .toggle svg {
                transform: rotate(180deg);
            }
        `
    ];

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { converter: jsonArray },
        date: { type: String },
        time: { type: String },
        place: { type: String },
        expanded: { type: Boolean, reflect: true }
    };

    constructor() {
        super();
        this.expanded = false;
        this._detailsId = `event-details-${nextId++}`;
    }

    get _hasDetails() {
        return this.children.length > 0;
    }

    toggle() {
        this.expanded = !this.expanded;
    }

    _onClick(event) {
        // Links inside the details must work without collapsing the card.
        const fromLink = event
            .composedPath()
            .some((el) => el instanceof HTMLAnchorElement);
        if (!fromLink && this._hasDetails) {
            this.toggle();
        }
    }

    render() {
        const dateLine = [this.date, this.time].filter(Boolean).join(" | ");
        const hasDetails = this._hasDetails;

        return html`<fyi-jakob-item @click=${this._onClick}>
            ${renderTags(this.tags)}
            <fyi-jakob-titles
                slot="content"
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles>
            ${
                hasDetails
                    ? html`<button
                          slot="aside"
                          type="button"
                          class="icon-button toggle"
                          aria-expanded=${this.expanded ? "true" : "false"}
                          aria-controls=${this._detailsId}
                          aria-label="Details ${
                              this.expanded ? "ausblenden" : "anzeigen"
                          }"
                      >
                          ${chevronUpDown}
                      </button>`
                    : nothing
            }
            <div>
                ${
                    dateLine
                        ? html`<p class="datetime">${dateLine}</p>`
                        : nothing
                }
                ${
                    this.place
                        ? html`<p class="place">${this.place}</p>`
                        : nothing
                }
            </div>
            <div
                id=${this._detailsId}
                class="collapse ${this.expanded ? "open" : ""}"
                ?inert=${!this.expanded}
            >
                <div class="collapse-inner">
                    <div class="details"><slot></slot></div>
                </div>
            </div>
        </fyi-jakob-item>`;
    }
}
