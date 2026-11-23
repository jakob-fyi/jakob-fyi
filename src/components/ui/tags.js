import { html, nothing } from "lit";

/**
 * Renders the tag list (and optional time tag) of a card into the `meta`
 * slot of `fyi-jakob-item`. Shared by all project components.
 */
export const renderTags = (tags, time, slot = "meta") => html`
    ${(tags ?? []).map(
        (tag) =>
            html`<fyi-jakob-meta-item slot=${slot}>${tag}</fyi-jakob-meta-item>`
    )}
    ${
        time
            ? html`<fyi-jakob-meta-item slot=${slot}
                  >${time}</fyi-jakob-meta-item
              >`
            : nothing
    }
`;

/** Attribute converter that never throws on malformed JSON. */
export const jsonArray = {
    fromAttribute(value) {
        if (!value) return [];
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            console.warn("[jakob.fyi] Invalid tags attribute:", value);
            return [];
        }
    }
};
