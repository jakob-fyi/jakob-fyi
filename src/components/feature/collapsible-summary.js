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

/**
 * Most recently added entry: the one with the latest `added` date if any
 * entry carries one, otherwise the first entry (lists are newest-first).
 */
export const latestEntry = (groups) => {
    const entries = groups.flatMap((group) => group.entries);
    const dated = entries.filter((entry) => entry.added);
    if (dated.length > 0) {
        return dated.reduce((latest, entry) =>
            entry.added > latest.added ? entry : latest
        );
    }
    return entries[0] ?? null;
};

/** Smallest and largest four-digit year among the group titles. */
export const yearRange = (groups) => {
    const years = groups
        .map((group) => group.title.trim())
        .filter((title) => /^\d{4}$/.test(title))
        .map(Number);
    if (years.length === 0) return null;
    return { from: Math.min(...years), to: Math.max(...years) };
};

const withLatest = (text, groups) => {
    const latest = latestEntry(groups);
    return latest?.title ? `${text} – zuletzt: ${latest.title}` : text;
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
        return withLatest(parts.join(" · "), groups);
    }

    const range = yearRange(groups);
    const text = range
        ? range.from === range.to
            ? `${label} aus ${range.from}`
            : `${label} von ${range.from} bis ${range.to}`
        : label;
    return withLatest(text, groups);
};
