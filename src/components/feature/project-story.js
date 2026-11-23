import { css, html, LitElement, nothing } from "lit";
import { chevronLeft, chevronRight, close, image } from "../shared/icons";
import { asideIconStyles, buttonStyles } from "../shared/styles";
import { jsonArray, renderTags } from "../ui/tags";

const GAP = 20;
/** Height reserved below the images for the bottom bar. */
const BAR_SPACE = 76;
/** Images before/after the current one that are loaded eagerly. */
const PRELOAD_BEHIND = 1;
const PRELOAD_AHEAD = 2;
/** Safety net: forget a programmatic scroll target after this long. */
const PENDING_TIMEOUT = 1000;

const prefersReducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const isVideo = (el) => el instanceof HTMLVideoElement;
const isMedia = (el) => el instanceof HTMLImageElement || isVideo(el);
/** Images use `alt`, videos `aria-label`. */
const captionOf = (el) =>
    (isVideo(el) ? el.getAttribute("aria-label") : el?.alt) ?? "";
const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

const safeDecode = (value) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

/**
 * Card that opens a fullscreen gallery of its slotted <img> and <video>
 * elements.
 *
 * - Native modal <dialog>: focus trap, inert page, top layer.
 * - Native horizontal scrolling with scroll snap: swipe, trackpad and
 *   momentum come for free; buttons, arrow keys, Home/End and clicks on a
 *   neighbouring image scroll programmatically.
 * - With an `id`, the gallery is linkable (`#id`) and the browser's back
 *   button / gesture closes it.
 * - The `alt` text of each image (`aria-label` of each video) is shown as
 *   its caption.
 * - The current video plays (muted, with native controls) while the gallery
 *   is open; all others are paused. With reduced motion it does not autoplay.
 *
 * Give every item `width`/`height` attributes so the strip can be laid out
 * before the media have loaded.
 */
export class ProjectStory extends LitElement {
    static styles = [
        buttonStyles,
        asideIconStyles,
        css`
            :host {
                display: block;
            }

            .visually-hidden {
                position: absolute;
                width: 1px;
                height: 1px;
                margin: -1px;
                padding: 0;
                overflow: hidden;
                clip: rect(0 0 0 0);
                white-space: nowrap;
                border: 0;
            }

            /* Card */

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

            .thumb {
                position: relative;
                flex-shrink: 0;
                width: 42px;
                height: 56px;
                box-sizing: border-box;
                border: 1px solid var(--item-border-color);
                border-radius: 6px;
                overflow: hidden;
                background-color: var(--item-border-color);
            }

            .thumb img,
            .thumb video {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .thumb-count {
                position: absolute;
                right: 3px;
                bottom: 3px;
                min-width: 1.4em;
                padding: 2px 4px;
                box-sizing: border-box;
                border-radius: 999px;
                background-color: rgba(0, 0, 0, 0.65);
                color: #ffffff;
                font-size: 11px;
                line-height: 1.2;
                text-align: center;
                font-variant-numeric: tabular-nums;
            }

            /* Dialog */

            dialog {
                position: fixed;
                inset: 0;
                width: 100%;
                height: 100%;
                max-width: none;
                max-height: none;
                margin: 0;
                padding: 0;
                border: 0;
                box-sizing: border-box;
                overflow: hidden;
                overscroll-behavior: contain;
                background-color: var(--page-background-color);
                color: var(--base-text-color);
            }

            dialog[open] {
                display: flex;
                flex-direction: column;
                animation: fade-in 200ms ease;
            }

            dialog::backdrop {
                background-color: var(--page-background-color);
            }

            @keyframes fade-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            .viewport {
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                align-items: center;
                gap: ${GAP}px;
                /* Bottom: room for the bar, so it doesn't cover the image. */
                padding: 20px 0
                    calc(${BAR_SPACE}px + env(safe-area-inset-bottom));
                box-sizing: border-box;
                overflow-x: auto;
                overflow-y: hidden;
                overscroll-behavior: contain;
                scroll-snap-type: x mandatory;
                scrollbar-width: none;
            }

            .viewport::-webkit-scrollbar {
                display: none;
            }

            /* Room to centre the first and last image. */
            .viewport::before,
            .viewport::after {
                content: "";
                flex: 0 0 50%;
            }

            .viewport ::slotted(img),
            .viewport ::slotted(video) {
                flex: 0 0 auto;
                height: 100%;
                width: auto;
                max-width: calc(100% - 48px);
                object-fit: contain;
                border-radius: 10px;
                scroll-snap-align: center;
                scroll-snap-stop: always;
                opacity: 0.35;
                transform: scale(0.9);
                transition:
                    opacity ease 300ms,
                    transform ease 300ms;
                cursor: pointer;
                user-select: none;
                -webkit-user-select: none;
            }

            .viewport ::slotted(img.active),
            .viewport ::slotted(video.active) {
                opacity: 1;
                transform: scale(1);
                cursor: default;
            }

            @media (hover: hover) {
                .viewport ::slotted(img:not(.active):hover),
                .viewport ::slotted(video:not(.active):hover) {
                    opacity: 0.5;
                    transform: scale(0.95);
                }
            }

            /* Bottom bar: caption + counter left, navigation right. */
            .bar {
                position: absolute;
                left: max(16px, env(safe-area-inset-left));
                right: max(16px, env(safe-area-inset-right));
                bottom: max(16px, env(safe-area-inset-bottom));
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                pointer-events: none; /* swipes pass through the gaps */
            }

            .info,
            .buttons {
                background-color: var(--page-background-color);
                box-shadow: 0 0 0 1px var(--item-border-color);
                border-radius: 999px;
                opacity: 0.85;
                transition: opacity ease 200ms;
            }

            .info {
                min-width: 0;
                display: flex;
                align-items: baseline;
                gap: 8px;
                padding: 6px 14px;
                font-size: 0.85em;
            }

            .caption {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .counter {
                flex-shrink: 0;
                color: var(--item-subtitle-text-color);
                font-variant-numeric: tabular-nums;
            }

            .buttons {
                flex-shrink: 0;
                margin-left: auto;
                display: flex;
                align-items: center;
                pointer-events: auto;
            }

            .buttons:hover,
            .buttons:focus-within {
                opacity: 1;
            }

            /* Phones in landscape: every pixel of height goes to the image. */
            @media (orientation: landscape) and (max-height: 500px) {
                .viewport {
                    padding: 12px 0;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                dialog[open] {
                    animation: none;
                }

                .viewport ::slotted(img),
                .viewport ::slotted(video),
                .info,
                .buttons {
                    transition: none;
                }
            }
        `
    ];

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { converter: jsonArray },
        time: { type: String },

        open: { type: Boolean, reflect: true },
        currentIndex: { state: true }
    };

    constructor() {
        super();
        this.open = false;
        this.currentIndex = 0;
        this._images = [];
        this._pushedHistory = false;
        this._pendingIndex = null;
        this._pendingTimer = null;
        this._scrollFrame = null;
        this._previousOverflow = "";
        this._resizeObserver =
            typeof ResizeObserver === "function"
                ? new ResizeObserver(() => this._recenter())
                : null;
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("hashchange", this._onLocationChange);
        window.addEventListener("popstate", this._onLocationChange);
        this.updateComplete.then(() => {
            if (this.isConnected && this._viewport) {
                this._resizeObserver?.observe(this._viewport);
            }
        });
        this._onLocationChange();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("hashchange", this._onLocationChange);
        window.removeEventListener("popstate", this._onLocationChange);
        this._resizeObserver?.disconnect();
        if (this.open) {
            this._teardown();
        }
    }

    get images() {
        return this._images;
    }

    get _dialog() {
        return this.shadowRoot?.querySelector("dialog") ?? null;
    }

    get _viewport() {
        return this.shadowRoot?.getElementById("viewport") ?? null;
    }

    get _maxIndex() {
        return Math.max(this._images.length - 1, 0);
    }

    _onSlotChange(event) {
        this._images = event.target.assignedElements().filter(isMedia);
        this._images.forEach((el, index) => {
            el.dataset.index = String(index);
            el.draggable = false;
            el.addEventListener(
                isVideo(el) ? "loadedmetadata" : "load",
                this._onImageLoad
            );
        });
        this.move(Math.min(this.currentIndex, this._maxIndex), false);
        this.requestUpdate(); // counter, thumbnail and buttons depend on _images
    }

    _onImageLoad = () => this._recenter();

    _onImageClick(event) {
        const img = event.composedPath().find(isMedia);
        if (img?.dataset.index !== undefined) {
            this.move(Number(img.dataset.index));
        }
    }

    /* Open / close */

    openGallery({ fromHistory = false } = {}) {
        if (this.open) return;
        this.open = true;

        this._previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        window.addEventListener("keydown", this._onKeyDown);

        const dialog = this._dialog;
        if (dialog && !dialog.open) {
            if (typeof dialog.showModal === "function") dialog.showModal();
            else dialog.setAttribute("open", "");
        }
        this.shadowRoot?.querySelector(".close")?.focus();
        this.move(this.currentIndex, false);

        if (!fromHistory && this.id && !this._isTargeted()) {
            history.pushState({ story: this.id }, "", `#${this.id}`);
            this._pushedHistory = true;
        }
    }

    close({ fromHistory = false } = {}) {
        if (!this.open) return;
        this._teardown();
        this.shadowRoot?.querySelector(".card")?.focus({ preventScroll: true });

        if (!fromHistory) {
            if (this._pushedHistory) {
                history.back();
            } else if (this._isTargeted()) {
                // Opened via deep link: drop the hash without leaving the page.
                history.replaceState(
                    history.state,
                    "",
                    location.pathname + location.search
                );
            }
        }
        this._pushedHistory = false;
    }

    _teardown() {
        this.open = false;
        window.removeEventListener("keydown", this._onKeyDown);
        document.documentElement.style.overflow = this._previousOverflow;
        this._clearPending();
        this._syncPlayback();
        const dialog = this._dialog;
        if (dialog?.open) {
            if (typeof dialog.close === "function") dialog.close();
            else dialog.removeAttribute("open");
        }
    }

    /** Native close (e.g. Escape via the dialog's cancel) keeps state in sync. */
    _onDialogClose() {
        this.close();
    }

    _isTargeted() {
        return (
            Boolean(this.id) &&
            safeDecode(location.hash.replace(/^#/, "")) === this.id
        );
    }

    _onLocationChange = async () => {
        if (this._isTargeted() && !this.open) {
            // A collapsed parent area is inert; let it open first.
            await this.closest("fyi-jakob-collapsible")?.updateComplete;
            await this.updateComplete;
            if (this.isConnected && this._isTargeted() && !this.open) {
                this.openGallery({ fromHistory: true });
            }
        } else if (!this._isTargeted() && this.open) {
            this._pushedHistory = false;
            this.close({ fromHistory: true });
        }
    };

    /* Navigation */

    forward() {
        this.move(this.currentIndex + 1);
    }

    backward() {
        this.move(this.currentIndex - 1);
    }

    /** Show image `index` centred in the viewport. Out-of-range is ignored. */
    move(index, smooth = true) {
        index = Number(index);
        if (!Number.isInteger(index) || index < 0 || index > this._maxIndex) {
            return;
        }
        this._setCurrent(index);
        this._scrollTo(index, smooth);
    }

    _setCurrent(index) {
        this.currentIndex = index;
        this._images.forEach((img, i) => {
            const active = i === index;
            img.classList.toggle("active", active);
            if (active) img.removeAttribute("aria-hidden");
            else img.setAttribute("aria-hidden", "true");
            if (
                this.open &&
                i >= index - PRELOAD_BEHIND &&
                i <= index + PRELOAD_AHEAD
            ) {
                if (isVideo(img)) img.preload = "auto";
                else img.loading = "eager";
            }
        });
        this._syncPlayback();
    }

    /** Only the current video plays, and only while the gallery is open. */
    _syncPlayback() {
        this._images.filter(isVideo).forEach((video) => {
            const current =
                this.open && video === this._images[this.currentIndex];
            video.controls = current;
            if (!current) {
                video.pause?.();
            } else if (video.paused !== false && !prefersReducedMotion()) {
                // Autoplay can be refused; the controls are there anyway.
                Promise.resolve(video.play?.()).catch(() => {});
            }
        });
    }

    _scrollTo(index, smooth) {
        const viewport = this._viewport;
        const img = this._images[index];
        if (!this.open || !viewport || !img) return;

        const left = viewport.scrollLeft + this._offsetFromCentre(img);
        const animate = smooth && !prefersReducedMotion();
        this._clearPending();
        if (animate) {
            this._pendingIndex = index;
            this._pendingTimer = setTimeout(
                () => this._clearPending(),
                PENDING_TIMEOUT
            );
        }
        viewport.scrollTo?.({ left, behavior: animate ? "smooth" : "auto" });
    }

    /** Horizontal distance between the image centre and the viewport centre. */
    _offsetFromCentre(img) {
        const box = this._viewport.getBoundingClientRect();
        const rect = img.getBoundingClientRect();
        return rect.left + rect.width / 2 - (box.left + box.width / 2);
    }

    _recenter() {
        if (this.open) this._scrollTo(this.currentIndex, false);
    }

    _clearPending() {
        clearTimeout(this._pendingTimer);
        this._pendingTimer = null;
        this._pendingIndex = null;
    }

    /** Native scrolling (swipe, trackpad) decides which image is current. */
    _onScroll() {
        if (this._scrollFrame !== null) return;
        this._scrollFrame = requestAnimationFrame(() => {
            this._scrollFrame = null;
            if (!this.open || !this._images.length) return;

            let closest = 0;
            let best = Infinity;
            this._images.forEach((img, i) => {
                const distance = Math.abs(this._offsetFromCentre(img));
                if (distance < best) {
                    best = distance;
                    closest = i;
                }
            });

            if (this._pendingIndex !== null) {
                // A programmatic scroll is under way; don't flicker through
                // the images it passes.
                if (closest === this._pendingIndex) this._clearPending();
                return;
            }
            if (closest !== this.currentIndex) this._setCurrent(closest);
        });
    }

    /** The user took over: follow their scrolling, not our target. */
    _onUserScrollStart() {
        this._clearPending();
    }

    _onKeyDown = (event) => {
        if (!this.open) return;
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        switch (event.key) {
            case "ArrowRight":
                this.forward();
                break;
            case "ArrowLeft":
                this.backward();
                break;
            case "Home":
                this.move(0);
                break;
            case "End":
                this.move(this._maxIndex);
                break;
            case "Escape":
                this.close();
                break;
            default:
                return;
        }
        event.preventDefault();
    };

    /* Rendering */

    _renderThumb() {
        const count = this._images.length;
        const first = this._images[0];
        const src = first?.currentSrc || first?.src;
        if (!src) {
            return html`<span slot="aside" class="aside-icon">${image}</span>`;
        }
        const videos = this._images.filter(isVideo).length;
        const images = count - videos;
        const label = [
            images ? plural(images, "Bild", "Bildern") : "",
            videos ? plural(videos, "Video", "Videos") : ""
        ]
            .filter(Boolean)
            .join(" und ");
        // A video's poster is its still; without one, show its first frame.
        const still = isVideo(first)
            ? first.poster
                ? html`<img src=${first.poster} alt="" loading="lazy" />`
                : html`<video
                      src=${`${src}#t=0.1`}
                      muted
                      playsinline
                      preload="metadata"
                      aria-hidden="true"
                  ></video>`
            : html`<img src=${src} alt="" loading="lazy" decoding="async" />`;
        return html`<span slot="aside" class="thumb">
            ${still}
            <span class="thumb-count" aria-hidden="true">${count}</span>
            <span class="visually-hidden">Galerie mit ${label}</span>
        </span>`;
    }

    render() {
        const count = this._images.length;
        const current = this._images[this.currentIndex];
        const caption = current ? captionOf(current) : "";
        const kind = isVideo(current) ? "Video" : "Bild";
        const announcement =
            this.open && count
                ? `${kind} ${this.currentIndex + 1} von ${count}${caption ? `: ${caption}` : ""}`
                : "";

        return html`<button
                type="button"
                class="card"
                aria-haspopup="dialog"
                @click=${() => this.openGallery()}
            >
                <fyi-jakob-item>
                    ${renderTags(this.tags, this.time)}
                    <fyi-jakob-titles
                        slot="content"
                        .mainTitle=${this.mainTitle}
                        .subTitle=${this.subTitle}
                    ></fyi-jakob-titles>
                    ${this._renderThumb()}
                </fyi-jakob-item>
            </button>
            <dialog aria-labelledby="story-title" @close=${this._onDialogClose}>
                <h2 id="story-title" class="visually-hidden">
                    ${this.mainTitle ?? "Galerie"}
                </h2>
                <div
                    class="viewport"
                    id="viewport"
                    @click=${this._onImageClick}
                    @scroll=${this._onScroll}
                    @pointerdown=${this._onUserScrollStart}
                    @wheel=${{
                        handleEvent: () => this._onUserScrollStart(),
                        passive: true
                    }}
                    @touchstart=${{
                        handleEvent: () => this._onUserScrollStart(),
                        passive: true
                    }}
                >
                    <slot @slotchange=${this._onSlotChange}></slot>
                </div>
                <div class="bar">
                    ${
                        count
                            ? html`<div class="info" aria-hidden="true">
                                  ${
                                      caption
                                          ? html`<span class="caption"
                                                >${caption}</span
                                            >`
                                          : nothing
                                  }
                                  <span class="counter"
                                      >${this.currentIndex + 1} / ${count}</span
                                  >
                              </div>`
                            : nothing
                    }
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
                            class="icon-button"
                            aria-label="Nächstes Bild"
                            ?disabled=${this.currentIndex >= this._maxIndex}
                            @click=${this.forward}
                        >
                            ${chevronRight}
                        </button>
                        <button
                            type="button"
                            class="icon-button close"
                            aria-label="Galerie schließen"
                            autofocus
                            @click=${() => this.close()}
                        >
                            ${close}
                        </button>
                    </nav>
                </div>
                <p class="visually-hidden" aria-live="polite">
                    ${announcement}
                </p>
            </dialog>`;
    }
}
