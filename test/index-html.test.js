import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    collectGroups,
    countEntries,
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

const content = (name) =>
    JSON.parse(
        readFileSync(resolve(process.cwd(), `content/${name}.json`), "utf8")
    );
const recommendations = content("recommendations");
const storyMedia = content("stories")
    .sections.flatMap((section) =>
        section.entries.filter((entry) => !entry.hidden)
    )
    .flatMap((story) => story.images);
const videoCount = storyMedia.filter((m) => /\.mp4$/i.test(m.src)).length;
const visibleEntries = (block) =>
    block.sections.flatMap((section) =>
        section.entries.filter((entry) => !entry.hidden)
    );

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
        });
    });

    describe("stories", () => {
        it("is a collapsible with one story per topic", () => {
            expect(doc.getElementById("stories").localName).toBe(
                "fyi-jakob-collapsible"
            );
            const groups = groupsOf("stories");
            expect(
                groups.map((g) => [g.title, g.entries.map((e) => e.title)])
            ).toEqual([
                ["Software & Tech", ["Dia Scanner"]],
                ["Carpentry", ["Bücherregal"]]
            ]);
        });

        it("gives every story a linkable id", () => {
            const stories = [
                ...doc.querySelectorAll("#stories fyi-jakob-project-story")
            ];
            expect(stories.map((s) => s.id)).toEqual([
                "dia-scanner",
                "buecherregal"
            ]);
        });

        it("gives every story image an alt attribute, size and lazy async loading", () => {
            const images = [
                ...doc.querySelectorAll("fyi-jakob-project-story > img")
            ];
            expect(images).toHaveLength(storyMedia.length - videoCount);
            for (const img of images) {
                const label = img.getAttribute("src");
                // Empty alt is fine: the gallery then just shows no caption.
                expect(img.getAttribute("alt"), label).not.toBeNull();
                expect(
                    Number(img.getAttribute("width")),
                    label
                ).toBeGreaterThan(0);
                expect(
                    Number(img.getAttribute("height")),
                    label
                ).toBeGreaterThan(0);
                expect(img.getAttribute("loading"), label).toBe("lazy");
                expect(img.getAttribute("decoding"), label).toBe("async");
            }
        });

        it("gives every story video a label, size and no eager preload", () => {
            const videos = [
                ...doc.querySelectorAll("fyi-jakob-project-story > video")
            ];
            expect(videos).toHaveLength(videoCount);
            for (const video of videos) {
                const label = video.getAttribute("src");
                expect(video.getAttribute("aria-label"), label).not.toBeNull();
                expect(
                    Number(video.getAttribute("width")),
                    label
                ).toBeGreaterThan(0);
                expect(
                    Number(video.getAttribute("height")),
                    label
                ).toBeGreaterThan(0);
                expect(video.getAttribute("preload"), label).toBe("none");
                expect(video.hasAttribute("muted"), label).toBe(true);
                expect(video.hasAttribute("playsinline"), label).toBe(true);
            }
        });
    });

    describe("recommendations", () => {
        it("is rendered exactly when content/recommendations.json is not hidden", () => {
            const element = doc.getElementById("recommendations");
            if (recommendations.hidden) {
                expect(element).toBeNull();
            } else {
                expect(element.localName).toBe("fyi-jakob-collapsible");
                expect(countEntries(groupsOf("recommendations"))).toBe(
                    visibleEntries(recommendations).length
                );
            }
        });

        it("every entry has title, subtitle, link, added date and tags", () => {
            const entries = visibleEntries(recommendations);
            expect(entries.length).toBeGreaterThan(0);
            for (const entry of entries) {
                const label = entry.title ?? JSON.stringify(entry);
                expect(entry.type, label).toBe("project-link");
                expect(entry.title, label).toBeTruthy();
                expect(entry.subtitle, label).toBeTruthy();
                expect(entry.link, label).toMatch(/^https?:\/\//);
                expect(entry.added, label).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                expect(entry.tags?.length, label).toBeGreaterThan(0);
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

    it("shows the stories count and teaser", () => {
        const stories = document.getElementById("stories");
        expect(stories.open).toBe(false);
        expect(shadow(stories, ".count").textContent.trim()).toBe("2");
        const teaser = shadow(stories, ".teaser").textContent;
        expect(teaser).toContain("Software & Tech");
        expect(teaser).toContain("Carpentry");
    });

    it("renders the recommendations only when they are not hidden", () => {
        const element = document.getElementById("recommendations");
        if (recommendations.hidden) {
            expect(element).toBeNull();
        } else {
            expect(shadow(element, ".count").textContent.trim()).toBe(
                String(visibleEntries(recommendations).length)
            );
        }
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
