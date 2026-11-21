import { css, html, LitElement } from "lit";
import { chevronDown, chevronUp } from "../shared/icons";
import { buttonStyles, collapseStyles } from "../shared/styles";
import {
    buildTeaser,
    collectGroups,
    countEntries
} from "./collapsible-summary";

/** decodeURIComponent that tolerates malformed input like "#%". */
const safeDecode = (value) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

/**
 * A whole page area (e.g. Archive, Recommendations) that can be collapsed.
 * Children are `fyi-jakob-section` elements; entries are counted
 * automatically and summarised in a teaser line while collapsed.
 *
 * Attributes:
 * - `heading`        visible title, e.g. "Archive"
 * - `summary`        "years" (year range) or "groups" (count per section)
 * - `summary-label`  prefix for the "years" teaser
 * - `collapse-label` text of the button at the end (default "<heading> einklappen")
 * - `open`           expanded state (reflected)
 *
 * Opens itself when `location.hash` points at it or at an element inside.
 */
export class Collapsible extends LitElement {
    static styles = [
        buttonStyles,
        collapseStyles,
        css`
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                /* Hover tint drawn over whatever background the page sets */
                transition: box-shadow 300ms ease;
            }

            /* Collapsed: the whole area is a click target */
            :host(:not([open])) {
                cursor: pointer;
            }

            :host(:not([open]):hover) {
                box-shadow: inset 0 0 0 100vmax var(--collapsible-hover-overlay);
            }

            h2 {
                margin: 30px 0 0;
                font-size: 1.5em;
                font-weight: var(--font-weight-semibold);
                color: var(--section-title-text-color);
            }

            .toggle {
                all: unset;
                display: inline-flex;
                align-items: center;
                gap: 14px;
                min-height: 44px;
                cursor: pointer;
                border-radius: 6px;
            }

            .toggle:focus-visible {
                outline: 2px solid var(--focus-ring-color);
                outline-offset: 4px;
            }

            .count {
                font-size: 10px;
            }

            .chevron {
                width: 36px;
                height: 36px;
                margin-left: -4px;
                pointer-events: none;
            }

            .toggle:hover .chevron,
            :host(:not([open]):hover) .chevron {
                background: var(--btn-hover-round);
            }

            .chevron svg {
                transition: transform 300ms ease;
            }

            :host([open]) .chevron svg {
                transform: rotate(180deg);
            }

            .teaser {
                margin: 12px 0 0;
                font-size: 0.9em;
                line-height: 1.5;
                color: var(--item-subtitle-text-color);
            }

            .head {
                /* h2 and teaser are one visual block */
                --content-row-gap: 0;
                padding-bottom: 20px;
                transition: padding-bottom 300ms ease;
            }

            :host(:not([open])) .head {
                padding-bottom: 0;
            }

            @media screen and (max-width: 600px) {
                h2 {
                    margin-top: 0;
                }

                .head::part(empty-title) {
                    display: none;
                }
            }

            .body {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--default-padding);
            }

            .footer-row {
                padding-top: 8px;
            }

            @media (prefers-reduced-motion: reduce) {
                .chevron svg {
                    transition: none;
                }
            }
        `
    ];

    static properties = {
        heading: { type: String },
        summary: { type: String },
        summaryLabel: { type: String, attribute: "summary-label" },
        collapseLabel: { type: String, attribute: "collapse-label" },
        open: { type: Boolean, reflect: true },
        _groups: { state: true }
    };

    constructor() {
        super();
        this.heading = "";
        this.summary = "years";
        this.open = false;
        this._groups = [];
        this.addEventListener("click", this._onAreaClick);
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("hashchange", this._onHashChange);
        this._refreshGroups();
        this._onHashChange();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("hashchange", this._onHashChange);
    }

    get count() {
        return countEntries(this._groups);
    }

    get teaser() {
        return buildTeaser(this.summary, this._groups, this.summaryLabel);
    }

    toggle() {
        this.open = !this.open;
    }

    /** While collapsed, a click anywhere on the area opens it. */
    _onAreaClick = (event) => {
        if (this.open) return;
        // Buttons and links handle their own clicks. Without this, the
        // "… einklappen" click would close and then immediately reopen.
        const fromControl = event
            .composedPath()
            .some(
                (el) =>
                    el instanceof HTMLButtonElement ||
                    el instanceof HTMLAnchorElement
            );
        if (fromControl) return;
        // Don't hijack text selection in the teaser.
        if (window.getSelection?.()?.toString()) return;
        this.open = true;
    };

    _refreshGroups() {
        this._groups = collectGroups([...this.children]);
    }

    /** True if `hash` targets this element or one of its descendants. */
    containsHash(hash) {
        const id = safeDecode((hash ?? "").replace(/^#/, ""));
        if (!id) return false;
        if (id === this.id) return true;
        const target = document.getElementById(id);
        return Boolean(target && this.contains(target));
    }

    _onHashChange = () => {
        if (!this.containsHash(location.hash)) return;
        this.open = true;

        // The browser scrolled while the target was still collapsed.
        const id = safeDecode(location.hash.slice(1));
        this.updateComplete.then(() =>
            setTimeout(() => document.getElementById(id)?.scrollIntoView(), 350)
        );
    };

    _collapseFromBottom() {
        this.open = false;
        const toggle = this.shadowRoot.querySelector(".toggle");
        toggle?.focus({ preventScroll: true });
        this.scrollIntoView({ block: "start" });
    }

    render() {
        const count = this.count;
        const collapseLabel =
            this.collapseLabel ?? `${this.heading} einklappen`;

        return html`<fyi-jakob-section class="head">
                <h2>
                    <button
                        type="button"
                        class="toggle"
                        aria-expanded=${this.open ? "true" : "false"}
                        aria-controls="content"
                        @click=${this.toggle}
                    >
                        <span>${this.heading}</span>
                        <fyi-jakob-meta-item
                            class="count"
                            aria-label="${count} Einträge"
                            >${count}</fyi-jakob-meta-item
                        >
                        <span class="icon-button chevron">${chevronDown}</span>
                    </button>
                </h2>
                <div
                    class="collapse ${this.open ? "" : "open"}"
                    aria-hidden=${this.open ? "true" : "false"}
                >
                    <div class="collapse-inner">
                        <p class="teaser">${this.teaser}</p>
                    </div>
                </div>
            </fyi-jakob-section>
            <div
                id="content"
                class="collapse ${this.open ? "open" : ""}"
                ?inert=${!this.open}
                style="width: 100%"
            >
                <div class="collapse-inner">
                    <div class="body">
                        <slot @slotchange=${this._refreshGroups}></slot>
                        <fyi-jakob-section class="footer-row">
                            <div>
                                <button
                                    type="button"
                                    class="text-button"
                                    @click=${this._collapseFromBottom}
                                >
                                    ${chevronUp} ${collapseLabel}
                                </button>
                            </div>
                        </fyi-jakob-section>
                    </div>
                </div>
            </div>`;
    }
}
