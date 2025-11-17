import { css, html, LitElement } from "lit";

export class Item extends LitElement {
    static styles = css`
        :host {
            text-decoration: none;
            transition: all ease 300ms;
            background-color: var(--item-background-color);
            border: 1px var(--item-border-color) solid;
            box-sizing: border-box;
            padding: 15px 20px;
            border-radius: var(--item-border-radius);
            transition: all ease 300ms;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;

            .container {
                flex: 1;
                width: 100%;
                display: flex;
                flex-direction: row;
                gap: 20px;
                align-items: center;

                .main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    width: 100%;

                    .meta {
                        display: flex;
                        flex-direction: row;
                        justify-content: space-between;
                        overflow: hidden;
                        max-height: 0px;
                        animation-name: hidemeta;
                        animation-duration: 100ms;
                        gap: 10px;
                        justify-content: flex-start;

                        > ::slotted(*) {
                            margin-bottom: 15px;
                        }
                    }
                }

                ::slotted(svg) {
                    line-height: 0;
                    stroke: #aaa;
                    flex-shrink: 0;
                }
            }

            .expanded {
                flex: 1;
                display: flex;
                flex-direction: column;
                width: 100%;
            }
        }

        :host(:hover) {
            padding: 20px;
            cursor: default;

            .container .main .meta {
                max-height: 100px;
                animation-name: showmeta;
                animation-duration: 300ms;
            }
        }

        @keyframes showmeta {
            0% {
                max-height: 0px;
                opacity: 0;
            }
            40% {
                max-height: 100px;
            }
            100% {
                opacity: 1;
            }
        }

        @keyframes hidemeta {
            0% {
                max-height: 100px;
                opacity: 1;
            }
            60% {
                max-height: 100px;
            }
            100% {
                max-height: 0px;
                opacity: 0;
            }
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { type: String },
        time: { type: String },
    };

    constructor() {
        super();
        this.name = "Somebody";
    }

    render() {
        return html` <div class="container">
                <div class="main">
                    <div class="meta">
                        <slot name="meta">
                            <!-- Meta -->
                        </slot>
                    </div>
                    <div class="content">
                        <slot name="content">
                            <!-- Content Slot for Title & Meta -->
                        </slot>
                    </div>
                </div>
                <slot name="aside">
                    <!-- Aside Slot for Actions and Symbols -->
                </slot>
            </div>
            <div class="expanded">
                <slot></slot>
            </div>`;
    }
}
