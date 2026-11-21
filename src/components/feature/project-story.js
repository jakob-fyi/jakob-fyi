import { css, html, LitElement, nothing } from "lit";
import {
    chevronLeft,
    chevronRight,
    close,
    contract,
    expand,
    image
} from "../shared/icons";
import { asideIconStyles, buttonStyles } from "../shared/styles";
import { jsonArray, renderTags } from "../ui/tags";

const GAP = 20;
const SWIPE_THRESHOLD = 40;

/**
 * Card that opens a fullscreen image gallery of its slotted <img> elements.
 * Navigation: buttons, arrow keys, swipe, click on a neighbouring image.
 * Escape closes the gallery.
 */
export class ProjectStory extends LitElement {
    static styles = [
        buttonStyles,
        asideIconStyles,
        css`
            :host {
                display: block;
            }

            .card {
                all: unset;
                display: block;
                width: 100%;
                box-sizing: border-box;
                border-radius: var(--item-border-radius);
                cursor: pointer;
            }

            .card:focus-visible {
                outline: 2px solid var(--focus-ring-color);
                outline-offset: 2px;
            }

            :host(:hover) fyi-jakob-item {
                background-color: var(--item-background-color-hover);
                border-color: var(--item-border-color-hover);
            }

            .fullscreen {
                position: fixed;
                inset: 0;
                display: none;
                z-index: 9999;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: var(--page-background-color);
                color: var(--base-text-color);
                box-sizing: border-box;
            }

            .fullscreen.opened {
                display: flex;
            }

            .container {
                opacity: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                display: flex;
                overflow: hidden;
                flex: 1;
                padding: 20px 0;
                transition: opacity ease 300ms;
                touch-action: pan-y;
            }

            .fullscreen.ready .container {
                opacity: 1;
            }

            .images {
                height: 100%;
                width: auto;
                display: flex;
                flex-direction: row;
                gap: ${GAP}px;
                flex: 0 0 200px;
            }

            .images ::slotted(img) {
                height: 100%;
                border-radius: 10px;
                overflow: hidden;
                opacity: 0.35;
                transform: scale(0.9);
                transition: all ease 300ms;
            }

            .images ::slotted(img:hover) {
                opacity: 0.5;
                transform: scale(0.95);
                cursor: pointer;
            }

            .images ::slotted(img.active) {
                opacity: 1;
                transform: scale(1);
                cursor: default;
            }

            footer {
                width: 100%;
                bottom: 0;
                transition: all ease 200ms;
            }

            .mode-inline footer {
                position: fixed;
                background: linear-gradient(
                    0deg,
                    var(--page-background-color) 0%,
                    var(--page-background-color) 20px,
                    transparent 100%
                );
            }

            .mode-container footer {
                position: relative;
            }

            .buttons {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 24px;
                padding: 20px;
            }

            .titles {
                padding: 0 20px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .titles h2 {
                font-size: 1em;
                font-weight: 500;
                text-align: center;
                margin: 0;
            }

            .titles h3 {
                font-size: 0.9em;
                font-weight: normal;
                text-align: center;
                margin: 0 0 10px;
                color: var(--item-subtitle-text-color);
            }

            .counter {
                font-size: 0.8em;
                color: var(--item-subtitle-text-color);
                font-variant-numeric: tabular-nums;
            }

            .tags {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
            }
        `
    ];

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { converter: jsonArray },
        time: { type: String },

        open: { type: Boolean, reflect: true },
        ready: { state: true },
        inlineMode: { state: true },
        currentIndex: { state: true }
    };

    constructor() {
        super();
        this.open = false;
        this.ready = false;
        this.inlineMode = false;
        this.currentIndex = 0;
        this._images = [];
        this._touchStart = null;
        this._returnFocusTo = null;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._detachGlobalListeners();
        if (this.open) {
            document.documentElement.style.overflow = "";
        }
    }

    get images() {
        return this._images;
    }

    _onSlotChange(event) {
        this._images = event.target
            .assignedElements()
            .filter((el) => el instanceof HTMLImageElement);
        this._images.forEach((img, index) => {
            img.dataset.index = String(index);
            img.draggable = false;
        });
        this.move(Math.min(this.currentIndex, this._maxIndex), false);
        this.requestUpdate(); // counter and button states depend on _images
    }

    _onImageClick(event) {
        const img = event
            .composedPath()
            .find((el) => el instanceof HTMLImageElement);
        if (img?.dataset.index !== undefined) {
            this.move(Number(img.dataset.index));
        }
    }

    get _maxIndex() {
        return Math.max(this._images.length - 1, 0);
    }

    openGallery() {
        this._returnFocusTo = this.shadowRoot.activeElement ?? this;
        this.open = true;
        this._attachGlobalListeners();
        document.documentElement.style.overflow = "hidden";

        // Wait for the overlay to be laid out before measuring.
        this.updateComplete.then(() => {
            requestAnimationFrame(() => {
                this.ready = true;
                this.move(this.currentIndex, false);
                this.shadowRoot.querySelector(".close")?.focus();
            });
        });
    }

    close() {
        this.open = false;
        this.ready = false;
        this._detachGlobalListeners();
        document.documentElement.style.overflow = "";
        this._returnFocusTo?.focus?.();
    }

    forward() {
        this.move(this.currentIndex + 1);
    }

    backward() {
        this.move(this.currentIndex - 1);
    }

    toggleMode() {
        this.inlineMode = !this.inlineMode;
        this.updateComplete.then(() => this.move(this.currentIndex, false));
    }

    /** Show image `index` centred in the viewport. Out-of-range is ignored. */
    move(index, transition = true) {
        index = Number(index);
        if (!Number.isInteger(index) || index < 0 || index > this._maxIndex) {
            return;
        }
        this.currentIndex = index;

        this._images.forEach((img, i) =>
            img.classList.toggle("active", i === index)
        );

        const container = this.shadowRoot?.getElementById("container");
        const strip = this.shadowRoot?.getElementById("images");
        const first = this._images[0];
        if (!container || !strip || !first) return;

        const imageWidth = first.clientWidth;
        const startX = container.clientWidth / 2 - imageWidth / 2;
        const x = startX - index * (imageWidth + GAP - 0.5);
        strip.style.transition = transition ? "transform ease 300ms" : "none";
        strip.style.transform = `translateX(${x}px)`;
    }

    _onKeyDown = (event) => {
        if (!this.open) return;
        switch (event.key) {
            case "ArrowRight":
                this.forward();
                break;
            case "ArrowLeft":
                this.backward();
                break;
            case "Escape":
                this.close();
                break;
            default:
                return;
        }
        event.preventDefault();
    };

    _onResize = () => this.move(this.currentIndex, false);

    _onTouchStart(event) {
        const touch = event.touches[0];
        this._touchStart = { x: touch.clientX, y: touch.clientY };
    }

    _onTouchEnd(event) {
        if (!this._touchStart) return;
        const touch = event.changedTouches[0];
        const dx = this._touchStart.x - touch.clientX;
        const dy = this._touchStart.y - touch.clientY;
        this._touchStart = null;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
            dx > 0 ? this.forward() : this.backward();
        }
    }

    _attachGlobalListeners() {
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("resize", this._onResize);
    }

    _detachGlobalListeners() {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("resize", this._onResize);
    }

    render() {
        const classes = [
            "fullscreen",
            this.open ? "opened" : "",
            this.ready ? "ready" : "",
            this.inlineMode ? "mode-inline" : "mode-container"
        ].join(" ");

        return html`<button
                type="button"
                class="card"
                aria-haspopup="dialog"
                @click=${this.openGallery}
            >
                <fyi-jakob-item>
                    ${renderTags(this.tags, this.time)}
                    <fyi-jakob-titles
                        slot="content"
                        .mainTitle=${this.mainTitle}
                        .subTitle=${this.subTitle}
                    ></fyi-jakob-titles>
                    <span slot="aside" class="aside-icon">${image}</span>
                </fyi-jakob-item>
            </button>
            <div
                class=${classes}
                role="dialog"
                aria-modal="true"
                aria-label=${this.mainTitle ?? "Galerie"}
                ?hidden=${!this.open}
            >
                <div
                    class="container"
                    id="container"
                    @touchstart=${this._onTouchStart}
                    @touchend=${this._onTouchEnd}
                >
                    <div
                        class="images"
                        id="images"
                        @click=${this._onImageClick}
                    >
                        <slot @slotchange=${this._onSlotChange}></slot>
                    </div>
                </div>
                <footer>
                    <nav class="buttons" aria-label="Galerie-Navigation">
                        <button
                            type="button"
                            class="icon-button"
                            aria-label="Vorheriges Bild"
                            ?disabled=${this.currentIndex <= 0}
                            @click=${this.backward}
                        >
                            ${chevronLeft}
                        </button>
                        <button
                            type="button"
                            class="icon-button close"
                            aria-label="Galerie schließen"
                            @click=${this.close}
                        >
                            ${close}
                        </button>
                        <button
                            type="button"
                            class="icon-button"
                            aria-label=${
                                this.inlineMode
                                    ? "Vollbild verlassen"
                                    : "Vollbild"
                            }
                            aria-pressed=${this.inlineMode ? "true" : "false"}
                            @click=${this.toggleMode}
                        >
                            ${this.inlineMode ? contract : expand}
                        </button>
                        <button
                            type="button"
                            class="icon-button"
                            aria-label="Nächstes Bild"
                            ?disabled=${this.currentIndex >= this._maxIndex}
                            @click=${this.forward}
                        >
                            ${chevronRight}
                        </button>
                    </nav>
                    <div class="titles">
                        <h2>${this.mainTitle}</h2>
                        <h3>${this.subTitle}</h3>
                        <div class="counter" aria-live="polite">
                            ${
                                this._images.length
                                    ? `${this.currentIndex + 1} / ${this._images.length}`
                                    : ""
                            }
                        </div>
                        <div class="tags">
                            ${renderTags(this.tags, this.time, nothing)}
                        </div>
                    </div>
                </footer>
            </div>`;
    }
}
