import { css, html, LitElement } from "lit";

export class ProjectStory extends LitElement {
    logPrefix = () => `[jakob.fyi] [Story Component, '${this.id}']`;

    static styles = css`
        :host(:hover) > fyi-jakob-item {
            cursor: pointer;
            background-color: var(--item-background-color-hover);
            border-color: var(--item-border-color-hover);
        }

        :host {
            svg {
                width: 24px;
            }

            .fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                display: none;
                z-index: 9999;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: #f4f4f4;
                box-sizing: border-box;
            }

            .fullscreen.opened {
                display: flex;
            }

            .fullscreen.opened .container {
                opacity: 0;
                transition: all ease 300ms;
            }

            .fullscreen.opened.ready .container {
                opacity: 1;
                transition: all ease 300ms;
            }

            .fullscreen .container {
                opacity: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                display: flex;
                overflow: hidden;
                flex: 1;
                padding: 20px 0px;
                transition: all ease 300ms;
            }

            .fullscreen .container .images {
                height: 100%;
                width: auto;
                display: flex;
                flex-direction: row;
                flex-basis: 200px;
                flex-grow: 0;
                flex-shrink: 0;
                transition: all ease 300ms;
            }

            .fullscreen .container .images ::slotted(img) {
                height: 100%;
                border-radius: 10px;
                overflow: hidden;
                opacity: 0.35;
                transform: scale(0.9);
                transition: all ease 300ms;
            }
            .fullscreen .container .images ::slotted(img:hover) {
                opacity: 0.5;
                transform: scale(0.95);
                cursor: pointer;
            }

            .fullscreen .container .images ::slotted(img.active) {
                opacity: 1;
                transform: scale(1);
            }

            .fullscreen .titles {
                padding: 20px;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .fullscreen .titles h2 {
                font-size: 1em;
                font-weight: 500;
                text-align: center;
                margin: 0;
            }

            .fullscreen .titles h3 {
                font-size: 0.9em;
                font-weight: normal;
                text-align: center;
                margin: 0;
                margin-bottom: 10px;
            }

            .fullscreen .buttons {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 30px;
                padding: 20px;
            }

            .fullscreen .buttons button {
                line-height: 0;
                padding: 10px;
                border-radius: 999em;
                border: 2px #ddd solid;
                transition: all ease 300ms;
                color: var(--header-toggle-text-color);
                border-color: var(--header-toggle-border-color);
            }

            .fullscreen .buttons button:hover {
                cursor: pointer;
                opacity: 0.65;
            }

            .fullscreen .progress-container {
                width: 100%;
                height: 4px;
            }

            .fullscreen .progress-container#progress {
                width: 0;
                height: 100%;
                background-color: #999;
            }
        }
    `;

    static properties = {
        id: { type: String },
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { type: Array },
        time: { type: String },

        open: { type: Boolean },
        ready: { state: true },
    };

    constructor() {
        super();
        console.log(this.logPrefix(), "constructor()");

        // Set initial Values
        this.open = false;
        this.ready = false;
        this.currentIndex = 0;
        this.mitteInContainer = 0;
        this.startX = 0;
        this.gap = 20;

        // Setup Listers
        addEventListener("resize", () => {
            console.log(this.logPrefix(), "On resize Event");
            this.calculateSizes();
            this.move(this.currentIndex);
        });
    }

    handleSlotchange(e) {
        console.log(this.logPrefix(), "handleSlotchange()");

        if (e.target.assignedElements()) {
            this.imageElements = e.target.assignedElements();
            this.containerElement = this.shadowRoot.getElementById("container");
            this.imagesContainerElement =
                this.shadowRoot.getElementById("images");
            this.firstImageElement = this.imageElements[0];
            this.progressElement = this.shadowRoot.getElementById("progress");

            this.imagesContainerElement.style.gap = `${this.gap}px`;

            console.log(
                this.logPrefix(),
                "Elements assigned, Slotted Image Count =",
                this.imageElements.length,
            );

            this.assignListenersAndIndizesToElements();
            this.calculateSizes();
            this.setAllImagesInactive();
            this.move(this.currentIndex);
        }
    }

    assignListenersAndIndizesToElements() {
        console.log(
            this.logPrefix(),
            "Assign Listeners and Indizes to Elements",
        );

        let i = 0;

        for (let el of this.imageElements) {
            el.setAttribute("index", i);
            el.addEventListener("click", (el) =>
                this.move(el.target.getAttribute("index")),
            );
            i++;
        }

        addEventListener("keyup", (event) => {
            if (event.key == "ArrowRight") {
                this.move(this.currentIndex + 1);
            }
            if (event.key == "ArrowLeft") {
                this.move(this.currentIndex - 1);
            }
        });

        document.addEventListener(
            "touchstart",
            (evt) => {
                const firstTouch = evt.touches[0];
                xDown = firstTouch.clientX;
                yDown = firstTouch.clientY;
            },
            false,
        );

        document.addEventListener(
            "touchmove",
            (evt) => {
                if (!xDown || !yDown) {
                    return;
                }

                var xUp = evt.touches[0].clientX;
                var yUp = evt.touches[0].clientY;

                var xDiff = xDown - xUp;
                var yDiff = yDown - yUp;

                if (Math.abs(xDiff) > Math.abs(yDiff)) {
                    /*most significant*/
                    if (xDiff > 0) {
                        this.move(this.currentIndex + 1);
                    } else {
                        this.move(this.currentIndex - 1);
                    }
                } else {
                    if (yDiff > 0) {
                        document.dispatchEvent("swipeDown");
                    } else {
                        document.dispatchEvent("swipeUp");
                    }
                }

                xDown = null;
                yDown = null;
            },
            false,
        );

        let xDown = null;
        let yDown = null;
    }

    calculateSizes() {
        console.log(this.logPrefix(), "Calculate Sizes");
        this.containerWidth = this.containerElement.clientWidth;
        this.imagesWidth = this.imagesContainerElement.clientWidth;
        this.imageWidth = this.firstImageElement.clientWidth;

        this.mitteInContainer = this.containerWidth / 2;
        this.startX = this.mitteInContainer - this.imageWidth / 2;

        this.maxIndex = this.imageElements.length - 1;

        console.log("--> containerWidth", this.containerWidth);
        console.log("--> imagesWidth", this.imagesWidth);
        console.log("--> imageWidth", this.imageWidth);
        console.log("--> mitteInContainer", this.mitteInContainer);
        console.log("--> startX", this.startX);
        console.log("--> maxIndex", this.maxIndex);
    }

    openStoryFullscreen() {
        this.open = true;
        setTimeout(() => {
            this.ready = true;
            console.log(this.ready);
            this.calculateSizes();
            this.move(this.currentIndex);
        }, 300);
    }

    setAllImagesInactive() {
        for (let el of this.imageElements) {
            el.classList.remove("active");
        }
    }

    move(index) {
        if (index <= this.maxIndex && index >= 0) {
            this.currentIndex = index;
            const newX =
                this.startX - this.currentIndex * (this.imageWidth + this.gap);
            console.log("Move to Index =", index, ", X-Translation =", newX);
            this.imagesContainerElement.style.transform = `translateX(${newX}px)`;

            this.setAllImagesInactive();
            this.imageElements[index].classList.add("active");
        }
    }

    forward = () => this.move(this.currentIndex + 1);
    backward = () => this.move(this.currentIndex - 1);

    close = () => {
        this.open = false;
    };

    render() {
        return html`<fyi-jakob-item @click="${this.openStoryFullscreen}">
                ${(this.tags ?? []).map(
                    (item) => html`
                        <fyi-jakob-meta-item slot="meta">
                            ${item}
                        </fyi-jakob-meta-item>
                    `,
                )}
                <fyi-jakob-meta-item slot="meta">
                    ${this.time}
                </fyi-jakob-meta-item>
                <fyi-jakob-titles
                    slot="content"
                    .mainTitle=${this.mainTitle}
                    .subTitle=${this.subTitle}
                ></fyi-jakob-titles>
                <svg slot="aside" viewBox="0 0 512 512">
                    <rect
                        x="48"
                        y="80"
                        width="416"
                        height="352"
                        rx="48"
                        ry="48"
                        fill="none"
                        stroke-linejoin="round"
                        stroke-width="32"
                    />
                    <circle
                        cx="336"
                        cy="176"
                        r="32"
                        fill="none"
                        stroke-miterlimit="10"
                        stroke-width="32"
                    />
                    <path
                        d="M304 335.79l-90.66-90.49a32 32 0 00-43.87-1.3L48 352M224 432l123.34-123.34a32 32 0 0143.11-2L464 368"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="32"
                    />
                </svg>
            </fyi-jakob-item>
            <div
                class="fullscreen ${this.open ? "opened" : "closed"} ${this
                    .ready
                    ? "ready"
                    : "not-ready"}"
            >
                <div class="container" id="container">
                    <div class="images" id="images">
                        <slot @slotchange=${this.handleSlotchange}></slot>
                    </div>
                </div>
                <nav class="buttons">
                    <button type="button" @click="${this.backward}">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="48"
                                d="M328 112L184 256l144 144"
                            />
                        </svg>
                    </button>
                    <button type="button" @click="${this.close}">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="32"
                                d="M368 368L144 144M368 144L144 368"
                            />
                        </svg>
                    </button>
                    <button type="button" @click="${this.forward}">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                        >
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="48"
                                d="M184 112l144 144-144 144"
                            />
                        </svg>
                    </button>
                </nav>
                <div class="titles">
                    <h2>${this.mainTitle}</h2>
                    <h3>${this.subTitle}</h3>
                    <div>
                        ${(this.tags ?? []).map(
                            (item) => html`
                                <fyi-jakob-meta-item>
                                    ${item}
                                </fyi-jakob-meta-item>
                            `,
                        )}
                        <fyi-jakob-meta-item>
                            ${this.time}
                        </fyi-jakob-meta-item>
                    </div>
                </div>
            </div> `;
    }
}
