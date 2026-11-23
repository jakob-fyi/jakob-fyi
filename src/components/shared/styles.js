import { css } from "lit";

/**
 * Shared button styles for use inside shadow roots. The light DOM gets the
 * same rules from `scss/_components.scss`.
 */
export const buttonStyles = css`
    .icon-button {
        width: 44px;
        height: 44px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: none;
        color: var(--header-toggle-text-color);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .icon-button:hover {
        background: var(--btn-hover-round);
    }

    .icon-button:disabled {
        opacity: 0.35;
        cursor: default;
        background: none;
    }

    .icon-button svg {
        width: 22px;
        height: 22px;
        fill: none;
        stroke: var(--icon-color);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .text-button {
        border: 0;
        border-radius: 6px;
        background: none;
        cursor: pointer;
        font: inherit;
        font-size: 14px;
        font-weight: 400;
        line-height: 24px;
        color: var(--header-toggle-text-color);
        padding: 10px 12px 10px 8px;
        margin-left: -8px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition:
            background-color 0.3s,
            color 0.3s;
    }

    .text-button:hover {
        background: var(--btn-hover-block);
        color: var(--base-text-color);
    }

    .text-button svg {
        width: 14px;
        height: 14px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .icon-button:focus-visible,
    .text-button:focus-visible {
        outline: 2px solid var(--focus-ring-color);
        outline-offset: 2px;
    }
`;

/**
 * Animated collapse without a fixed max-height: the wrapper animates
 * `grid-template-rows` between 0fr and 1fr, so content of any height fits.
 * Markup: `<div class="collapse" ?inert=${!open}><div class="collapse-inner">…`
 */
export const collapseStyles = css`
    .collapse {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
            grid-template-rows 300ms ease,
            opacity 300ms ease;
    }

    .collapse.open {
        grid-template-rows: 1fr;
        opacity: 1;
    }

    /* clip (not hidden): no scroll container, so position: sticky inside works */
    .collapse-inner {
        min-height: 0;
        overflow: clip;
    }

    @media (prefers-reduced-motion: reduce) {
        .collapse {
            transition: none;
        }
    }
`;

/** Decorative icon placed in the `aside` slot of `fyi-jakob-item`. */
export const asideIconStyles = css`
    .aside-icon {
        display: inline-flex;
        flex-shrink: 0;
        line-height: 0;
    }

    .aside-icon svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: var(--icon-color);
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
`;

/** Remove link styling from an anchor that wraps a whole card. */
export const cardLinkStyles = css`
    a.card {
        display: block;
        color: inherit;
        text-decoration: none;
        border-radius: var(--item-border-radius);
    }

    a.card:focus-visible {
        outline: 2px solid var(--focus-ring-color);
        outline-offset: 2px;
    }
`;
