import { describe, expect, it } from "vitest";
import {
    buildTeaser,
    collectGroups,
    countEntries,
    latestEntry,
    yearRange
} from "../src/components/feature/collapsible-summary.js";
import { sections } from "./helpers.js";

const group = (title, ...entries) => ({
    title,
    entries: entries.map((e) =>
        typeof e === "string" ? { title: e, added: null } : e
    )
});

describe("collectGroups", () => {
    it("returns [] for no sections", () => {
        expect(collectGroups([])).toEqual([]);
    });

    it("collects all entry types with title and added date", () => {
        const groups = collectGroups(
            sections(`
                <fyi-jakob-section maintitle="2025">
                    <fyi-jakob-project-link maintitle="Link" added="2025-01-02"></fyi-jakob-project-link>
                    <fyi-jakob-project-text maintitle="Text"></fyi-jakob-project-text>
                    <fyi-jakob-project-event maintitle="Event"></fyi-jakob-project-event>
                    <fyi-jakob-project-story maintitle="Story"></fyi-jakob-project-story>
                </fyi-jakob-section>`)
        );
        expect(groups).toEqual([
            {
                title: "2025",
                entries: [
                    { title: "Link", added: "2025-01-02" },
                    { title: "Text", added: null },
                    { title: "Event", added: null },
                    { title: "Story", added: null }
                ]
            }
        ]);
    });

    it("finds nested entries but ignores other elements", () => {
        const [g] = collectGroups(
            sections(`
                <fyi-jakob-section maintitle="X">
                    <div><fyi-jakob-project-text maintitle="Nested"></fyi-jakob-project-text></div>
                    <p maintitle="not an entry"></p>
                </fyi-jakob-section>`)
        );
        expect(g.entries.map((e) => e.title)).toEqual(["Nested"]);
    });

    it("drops empty sections and non-section children", () => {
        const groups = collectGroups(
            sections(`
                <fyi-jakob-section maintitle="Empty"></fyi-jakob-section>
                <div><fyi-jakob-project-text maintitle="Outside"></fyi-jakob-project-text></div>
                <fyi-jakob-section maintitle="Full">
                    <fyi-jakob-project-text maintitle="A"></fyi-jakob-project-text>
                </fyi-jakob-section>`)
        );
        expect(groups.map((g) => g.title)).toEqual(["Full"]);
    });

    it("defaults missing titles to empty strings", () => {
        const [g] = collectGroups(
            sections(
                `<fyi-jakob-section><fyi-jakob-project-text></fyi-jakob-project-text></fyi-jakob-section>`
            )
        );
        expect(g).toEqual({ title: "", entries: [{ title: "", added: null }] });
    });
});

describe("countEntries", () => {
    it("is 0 for no groups", () => {
        expect(countEntries([])).toBe(0);
    });

    it("sums the entries of all groups", () => {
        expect(countEntries([group("a", "1", "2"), group("b", "3")])).toBe(3);
    });
});

describe("latestEntry", () => {
    it("is null for no groups", () => {
        expect(latestEntry([])).toBeNull();
    });

    it("falls back to the first entry when nothing has an `added` date", () => {
        expect(
            latestEntry([group("a", "First", "Second"), group("b", "Third")])
                .title
        ).toBe("First");
    });

    it("picks the entry with the latest `added` date across groups", () => {
        const groups = [
            group("Books", { title: "Old", added: "2026-01-01" }, "Undated"),
            group("Movies", { title: "Newest", added: "2026-11-18" }),
            group("Podcasts", { title: "Mid", added: "2026-05-15" })
        ];
        expect(latestEntry(groups).title).toBe("Newest");
    });

    it("prefers dated entries over undated ones even if undated comes first", () => {
        const groups = [
            group("a", "Undated", { title: "Dated", added: "2020-01-01" })
        ];
        expect(latestEntry(groups).title).toBe("Dated");
    });
});

describe("yearRange", () => {
    it("is null for no groups", () => {
        expect(yearRange([])).toBeNull();
    });

    it("is null when no group title is a year", () => {
        expect(
            yearRange([group("Books", "a"), group("Carpentry", "b")])
        ).toBeNull();
    });

    it("handles a single year", () => {
        expect(yearRange([group("2024", "a")])).toEqual({
            from: 2024,
            to: 2024
        });
    });

    it("excludes non-year titles like Carpentry and ignores order", () => {
        const groups = [
            group("2019", "a"),
            group("2026", "b"),
            group("2012", "c"),
            group("Carpentry", "d"),
            group("12345", "e"),
            group("20x4", "f")
        ];
        expect(yearRange(groups)).toEqual({ from: 2012, to: 2026 });
    });

    it("trims whitespace around year titles", () => {
        expect(yearRange([group(" 2020 ", "a")])).toEqual({
            from: 2020,
            to: 2020
        });
    });
});

describe("buildTeaser", () => {
    it("is empty for no groups", () => {
        expect(buildTeaser("years", [])).toBe("");
        expect(buildTeaser("groups", [])).toBe("");
    });

    describe("years mode", () => {
        it("shows the year range and the latest (first) entry", () => {
            const groups = [group("2026", "Newest"), group("2012", "Oldest")];
            expect(buildTeaser("years", groups, "Projekte")).toBe(
                "Projekte von 2012 bis 2026 – zuletzt: Newest"
            );
        });

        it("uses 'aus' for a single year", () => {
            expect(buildTeaser("years", [group("2024", "A")], "Projekte")).toBe(
                "Projekte aus 2024 – zuletzt: A"
            );
        });

        it("defaults the label to 'Einträge'", () => {
            expect(buildTeaser("years", [group("2024", "A")])).toBe(
                "Einträge aus 2024 – zuletzt: A"
            );
        });

        it("falls back to the bare label without year titles", () => {
            expect(
                buildTeaser("years", [group("Carpentry", "Regal")], "Projekte")
            ).toBe("Projekte – zuletzt: Regal");
        });

        it("omits 'zuletzt' when the latest entry has no title", () => {
            expect(buildTeaser("years", [group("2024", "")], "Projekte")).toBe(
                "Projekte aus 2024"
            );
        });
    });

    describe("groups mode", () => {
        it("lists the count per group and the most recently added entry", () => {
            const groups = [
                group(
                    "Books",
                    { title: "Sisyphos", added: "2026-11-14" },
                    { title: "Zweig", added: "2026-10-02" }
                ),
                group("Movies", { title: "Zone", added: "2026-11-18" })
            ];
            expect(buildTeaser("groups", groups)).toBe(
                "2 Books · 1 Movies – zuletzt: Zone"
            );
        });

        it("uses the first entry when nothing is dated", () => {
            expect(buildTeaser("groups", [group("Books", "A", "B")])).toBe(
                "2 Books – zuletzt: A"
            );
        });
    });
});
