import { nothing } from "lit";

/** `rel` for links opening a new browsing context; `nothing` otherwise. */
export const relFor = (target) =>
    target === "_blank" ? "noopener noreferrer" : nothing;
