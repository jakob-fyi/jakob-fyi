import { svg } from "lit";

/**
 * Stroke icons on a 24×24 grid. Colour, stroke width and size come from the
 * surrounding CSS (see `iconButtonStyles` and `--icon-color`).
 */
const icon = (content) =>
    svg`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${content}</svg>`;

export const chevronDown = icon(svg`<path d="M6 9L12 15L18 9" />`);
export const chevronUp = icon(svg`<path d="M6 15L12 9L18 15" />`);
export const chevronLeft = icon(svg`<path d="M15 6L9 12L15 18" />`);
export const chevronRight = icon(svg`<path d="M9 6L15 12L9 18" />`);
export const chevronUpDown = icon(
    svg`<path d="M7 9.5L12 5L17 9.5M7 14.5L12 19L17 14.5" />`
);
export const close = icon(svg`<path d="M6 6L18 18M18 6L6 18" />`);
export const externalLink = icon(
    svg`<path d="M10 6H6C4.9 6 4 6.9 4 8V18C4 19.1 4.9 20 6 20H16C17.1 20 18 19.1 18 18V14M14 4H20M20 4V10M20 4L10 14" />`
);
export const image = icon(
    svg`<rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="15.5" cy="9.5" r="1.5" /><path d="M3 16L8 11.5C8.6 11 9.4 11 10 11.5L15 16M13 14L15 12C15.6 11.5 16.4 11.5 17 12L21 15.5" />`
);
