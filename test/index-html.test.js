import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    buildTeaser,
    collectGroups,
    countEntries,
    ENTRY_SELECTOR,
    yearRange
} from "../src/components/feature/collapsible-summary.js";
import { mount, shadow } from "./helpers.js";

const source = readFileSync(resolve(process.cwd(), "src/index.html"), "utf8");
// Stylesheet links are dropped so happy-dom does not try to fetch them.
const doc = new DOMParser().parseFromString(
    source.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, ""),
    "text/html"
);

const groupsOf = (id) => collectGroups([...doc.getElementById(id).children]);
const recommendationEntries = () => [
    ...doc.querySelectorAll(`#recommendations :is(${ENTRY_SELECTOR})`)
];

describe("src/index.html content", () => {
    it("has the typos fixed", () => {
        expect(source).toContain('maintitle="Where I do this stuff"');
        expect(source).toContain("Digitalisierung, Verwaltung und Forschung");
        expect(source).toContain("Verwaltungsplattform");
        expect(source).not.toContain("Where i do this stuff");
        expect(source).not.toContain("Digitaliserung");
        expect(source).not.toMatch(/Verwaltungsplatform/);
    });

    it("has no leftover lightgallery references", () => {
        expect(source).not.toMatch(/lightgallery|lg-zoom|lg-thumbnail/i);
    });

    it("protects every plain target=_blank anchor with rel=noopener", () => {
        const anchors = [...doc.querySelectorAll('a[target="_blank"]')];
        expect(anchors.length).toBeGreaterThan(0);
        for (const a of anchors) {
            expect(a.getAttribute("rel") ?? "", a.outerHTML).toMatch(
                /\bnoopener\b/
            );
            expect(a.getAttribute("href"), a.outerHTML).toMatch(/^https?:\/\//);
        }
    });

    it("only uses target=_blank on custom elements with an http(s) link", () => {
        const elements = [...doc.querySelectorAll('[target="_blank"]:not(a)')];
        expect(elements.length).toBeGreaterThan(0);
        for (const el of elements) {
            expect(el.localName, el.outerHTML).toMatch(/^fyi-jakob-/);
            expect(el.getAttribute("link"), el.outerHTML).toMatch(
                /^https?:\/\//
            );
        }
    });

    it("has only valid JSON array tags attributes", () => {
        const tagged = [...doc.querySelectorAll("[tags]")];
        expect(tagged.length).toBeGreaterThan(0);
        for (const el of tagged) {
            const raw = el.getAttribute("tags");
            let parsed;
            expect(() => (parsed = JSON.parse(raw)), raw).not.toThrow();
            expect(Array.isArray(parsed), raw).toBe(true);
            expect(
                parsed.every((t) => typeof t === "string" && t.length > 0),
                raw
            ).toBe(true);
        }
    });

    it("gives the theme toggle an accessible name", () => {
        const button = doc.querySelector('button[onclick*="toggleTheme"]');
        expect(button).not.toBeNull();
        expect(button.getAttribute("aria-label")).toBeTruthy();
        expect(button.getAttribute("type")).toBe("button");
    });

    it("has unique ids", () => {
        const ids = [...doc.querySelectorAll("[id]")].map((el) => el.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    describe("archive", () => {
        it("is a collapsible with 22 entries spanning 2012–2026", () => {
            const archive = doc.getElementById("archive");
            expect(archive.localName).toBe("fyi-jakob-collapsible");
            const groups = groupsOf("archive");
            expect(countEntries(groups)).toBe(22);
            expect(yearRange(groups)).toEqual({ from: 2012, to: 2026 });
            expect(groups.map((g) => g.title)).toContain("Carpentry");
        });
    });

    describe("recommendations", () => {
        const media = {
            Books: "Book",
            Movies: "Movie",
            Documentaries: "Documentary",
            Podcasts: "Podcast"
        };

        it("is a collapsible with 4 media sections and 18 entries", () => {
            expect(doc.getElementById("recommendations").localName).toBe(
                "fyi-jakob-collapsible"
            );
            const groups = groupsOf("recommendations");
            expect(groups.map((g) => [g.title, g.entries.length])).toEqual([
                ["Books", 6],
                ["Movies", 4],
                ["Documentaries", 4],
                ["Podcasts", 4]
            ]);
            expect(countEntries(groups)).toBe(18);
        });

        it("teaser names The Zone of Interest as the latest addition", () => {
            expect(buildTeaser("groups", groupsOf("recommendations"))).toBe(
                "6 Books · 4 Movies · 4 Documentaries · 4 Podcasts – zuletzt: The Zone of Interest"
            );
        });

        it("every entry has maintitle, subtitle, link, added and [medium, topic] tags", () => {
            const entries = recommendationEntries();
            expect(entries).toHaveLength(18);
            for (const entry of entries) {
                const label =
                    entry.getAttribute("maintitle") ?? entry.outerHTML;
                expect(entry.getAttribute("maintitle"), label).toBeTruthy();
                expect(entry.getAttribute("subtitle"), label).toBeTruthy();
                expect(entry.getAttribute("link"), label).toMatch(
                    /^https?:\/\//
                );
                expect(entry.getAttribute("added"), label).toMatch(
                    /^\d{4}-\d{2}-\d{2}$/
                );

                const tags = JSON.parse(entry.getAttribute("tags"));
                expect(tags, label).toHaveLength(2);
                const section = entry
                    .closest("fyi-jakob-section")
                    .getAttribute("maintitle");
                expect(tags[0], label).toBe(media[section]);
            }
        });
    });
});

describe("src/index.html rendered", () => {
    beforeAll(async () => {
        Element.prototype.scrollIntoView ??= () => {};
        // Drop scripts and images: we only want the components, without network access.
        const body = doc.body.cloneNode(true);
        body.querySelectorAll("script").forEach((s) => s.remove());
        body.querySelectorAll("img").forEach((img) =>
            img.removeAttribute("src")
        );
        await mount(body.innerHTML);
    });

    afterAll(() => {
        document.body.innerHTML = "";
    });

    it("shows the archive count and teaser", () => {
        const archive = document.getElementById("archive");
        expect(archive.open).toBe(false);
        expect(shadow(archive, ".count").textContent.trim()).toBe("22");
        expect(shadow(archive, ".teaser").textContent).toMatch(
            /^Vorträge, Projekte und Texte von 2012 bis 2026 – zuletzt: /
        );
    });

    it("shows the recommendations count and teaser", () => {
        const recommendations = document.getElementById("recommendations");
        expect(shadow(recommendations, ".count").textContent.trim()).toBe("18");
        expect(shadow(recommendations, ".teaser").textContent).toContain(
            "zuletzt: The Zone of Interest"
        );
    });

    it("renders the mailto link without a new tab", () => {
        const mail = [...document.querySelectorAll("fyi-jakob-link")].find(
            (el) => el.getAttribute("link").startsWith("mailto:")
        );
        expect(shadow(mail, "a").getAttribute("target")).toBe("_self");
    });

    it("loads the carpentry story with all 15 images", () => {
        const story = document.getElementById("buecherregal");
        // happy-dom does not fire the initial slotchange a browser would.
        story.shadowRoot
            .querySelector("slot")
            .dispatchEvent(new Event("slotchange"));
        expect(story.images).toHaveLength(15);
        expect(story.mainTitle).toBe("Bücherregal");
    });
});
