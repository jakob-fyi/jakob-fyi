/**
 * Pure helpers that derive the count and teaser line of a collapsible area
 * from its `fyi-jakob-section` children. Kept DOM-light for easy testing.
 */

export const ENTRY_SELECTOR = [
    "fyi-jakob-project-link",
    "fyi-jakob-project-text",
    "fyi-jakob-project-event",
    "fyi-jakob-project-story"
].join(", ");

/**
 * @param {Element[]} sections `fyi-jakob-section` elements in document order
 * @returns {{ title: string, entries: { title: string, added: string|null }[] }[]}
 */
export const collectGroups = (sections) =>
    sections
        .filter((section) => section.localName === "fyi-jakob-section")
        .map((section) => ({
            title: section.getAttribute("maintitle") ?? "",
            entries: [...section.querySelectorAll(ENTRY_SELECTOR)].map(
                (entry) => ({
                    title: entry.getAttribute("maintitle") ?? "",
                    added: entry.getAttribute("added")
                })
            )
        }))
        .filter((group) => group.entries.length > 0);

export const countEntries = (groups) =>
    groups.reduce((sum, group) => sum + group.entries.length, 0);

/** Smallest and largest four-digit year among the group titles. */
export const yearRange = (groups) => {
    const years = groups
        .map((group) => group.title.trim())
        .filter((title) => /^\d{4}$/.test(title))
        .map(Number);
    if (years.length === 0) return null;
    return { from: Math.min(...years), to: Math.max(...years) };
};

/**
 * @param {"years"|"groups"} mode
 * @param {ReturnType<typeof collectGroups>} groups
 * @param {string} [label] prefix for the "years" mode
 */
export const buildTeaser = (mode, groups, label = "Einträge") => {
    if (groups.length === 0) return "";

    if (mode === "groups") {
        const parts = groups.map(
            (group) => `${group.entries.length} ${group.title}`
        );
        return parts.join(" · ");
    }

    const range = yearRange(groups);
    if (!range) return label;
    return range.from === range.to
        ? `${label} aus ${range.from}`
        : `${label} von ${range.from} bis ${range.to}`;
};
