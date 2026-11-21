import { css, html, LitElement } from "lit";

/**
 * The card ("Kasten") every project component is built on.
 * Slots: `meta` (tags, revealed on hover), `content` (titles),
 * `aside` (icon or action), default (content below the titles).
 */
export class Item extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
            padding: 15px 20px;
            background-color: var(--item-background-color);
            border: 1px solid var(--item-border-color);
            border-radius: var(--item-border-radius);
            transition: all ease 300ms;
        }

        .container {
            flex: 1;
            width: 100%;
            display: flex;
            flex-direction: row;
            gap: 20px;
            align-items: center;
        }

        .main {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
        }

        .meta {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            gap: 10px;
            overflow: hidden;
            max-height: 0;
            animation-name: hidemeta;
            animation-duration: 100ms;
        }

        .meta ::slotted(*) {
            margin-bottom: 15px;
        }

        .expanded {
            flex: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        :host(:hover),
        :host(:focus-within) {
            padding: 20px;
        }

        :host(:hover) .meta,
        :host(:focus-within) .meta {
            max-height: 100px;
            animation-name: showmeta;
            animation-duration: 300ms;
        }

        @keyframes showmeta {
            0% {
                max-height: 0;
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
                max-height: 0;
                opacity: 0;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            :host,
            .meta {
                transition: none;
                animation: none !important;
            }
        }
    `;

    render() {
        return html`<div class="container">
                <div class="main">
                    <div class="meta"><slot name="meta"></slot></div>
                    <div class="content"><slot name="content"></slot></div>
                </div>
                <slot name="aside"></slot>
            </div>
            <div class="expanded"><slot></slot></div>`;
    }
}
