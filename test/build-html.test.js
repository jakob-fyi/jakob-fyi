import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
    escapeAttribute,
    GENERATED_NOTICE,
    PLACEHOLDER,
    renderEntry,
    renderPage,
    renderSection
} from "../scripts/content/render.mjs";
import { ENTRY_FIELDS, validateContent } from "../scripts/content/validate.mjs";

const root = process.cwd();
const parse = (markup) => {
    const container = document.createElement("div");
    container.innerHTML = markup;
    return container.firstElementChild;
};

const section = (entries, extra = {}) => ({
    type: "section",
    entries,
    ...extra
});
const link = (extra = {}) => ({
    type: "project-link",
    title: "Titel",
    link: "https://example.org",
    ...extra
});

describe("render", () => {
    it("maps data fields to the component attributes", () => {
        const el = parse(
            renderEntry(
                link({
                    id: "ddfiy",
                    subtitle: "Sub",
                    tags: ["PWA", "App"],
                    time: "2023",
                    target: "_blank",
                    added: "2026-11-14"
                })
            )
        );
        expect(el.localName).toBe("fyi-jakob-project-link");
        expect(
            Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]))
        ).toEqual({
            id: "ddfiy",
            maintitle: "Titel",
            subtitle: "Sub",
            tags: '["PWA", "App"]',
            time: "2023",
            link: "https://example.org",
            target: "_blank",
            added: "2026-11-14"
        });
    });

    it("escapes quotes, ampersands and angle brackets in attributes and tags", () => {
        expect(escapeAttribute(`a "b" & <c>`)).toBe(
            "a &quot;b&quot; &amp; &lt;c&gt;"
        );
        const el = parse(
            renderEntry(
                link({ title: `Gault & "Millau"`, tags: ["Rock 'n' Roll"] })
            )
        );
        expect(el.getAttribute("maintitle")).toBe(`Gault & "Millau"`);
        expect(JSON.parse(el.getAttribute("tags"))).toEqual(["Rock 'n' Roll"]);
    });

    it("renders story images and event bodies as children", () => {
        const story = parse(
            renderEntry({
                type: "project-story",
                id: "kasten",
                title: "Regal",
                images: [{ src: "assets/a.jpg", alt: "Entwurf" }]
            })
        );
        const img = story.querySelector("img");
        expect(img.getAttribute("src")).toBe("../assets/a.jpg");
        expect(img.getAttribute("loading")).toBe("lazy");

        const event = parse(
            renderEntry({
                type: "project-event",
                title: "Vortrag",
                body: ["<p>Eins</p>", "<p>Zwei</p>"]
            })
        );
        expect([...event.children].map((c) => c.textContent)).toEqual([
            "Eins",
            "Zwei"
        ]);
    });

    it("writes image sizes and async decoding", () => {
        const story = parse(
            renderEntry({
                type: "project-story",
                id: "s",
                title: "S",
                images: [
                    { src: "assets/a.jpg", alt: "", width: 1080, height: 1920 }
                ]
            })
        );
        const img = story.querySelector("img");
        expect([
            img.getAttribute("width"),
            img.getAttribute("height"),
            img.getAttribute("decoding")
        ]).toEqual(["1080", "1920", "async"]);
    });

    it("renders .mp4 sources as muted looping videos", () => {
        const story = parse(
            renderEntry({
                type: "project-story",
                id: "s",
                title: "S",
                images: [
                    {
                        src: "assets/a.mp4",
                        alt: "Film",
                        width: 480,
                        height: 796,
                        poster: "assets/a.jpg"
                    }
                ]
            })
        );
        const video = story.querySelector("video");
        expect(story.querySelector("img")).toBeNull();
        expect(
            Object.fromEntries(
                [...video.attributes].map((a) => [a.name, a.value])
            )
        ).toEqual({
            muted: "",
            loop: "",
            playsinline: "",
            preload: "none",
            width: "480",
            height: "796",
            poster: "../assets/a.jpg",
            src: "../assets/a.mp4",
            "aria-label": "Film"
        });
    });

    it("renders nothing for a hidden block", () => {
        const page = renderPage(
            "<main>\n    <!-- @content recs -->\n</main>\n",
            {
                recs: {
                    type: "collapsible",
                    hidden: true,
                    id: "recs",
                    heading: "R",
                    sections: []
                }
            }
        );
        expect(page).toBe("<main>\n</main>\n");
    });

    it("leaves out hidden entries", () => {
        const el = parse(
            renderSection(
                section(
                    [link({ title: "A" }), link({ title: "B", hidden: true })],
                    { title: "2025" }
                )
            )
        );
        expect(el.getAttribute("maintitle")).toBe("2025");
        expect(
            [...el.children].map((c) => c.getAttribute("maintitle"))
        ).toEqual(["A"]);
    });

    it("fills placeholders with the matching block, indented like the placeholder", () => {
        const page = renderPage(
            "<!doctype html>\n<main>\n    <!-- @content featured -->\n</main>\n",
            {
                featured: section([link()], { id: "featured" })
            }
        );
        expect(page).toContain(GENERATED_NOTICE);
        expect(page).toMatch(/^ {4}<fyi-jakob-section id="featured">$/m);
        expect(page).toMatch(/^ {8}<fyi-jakob-project-link/m);
        expect(page).not.toContain("@content");
    });
});

describe("validate", () => {
    const options = { placeholders: ["a"] };

    it("accepts valid content", () => {
        expect(validateContent({ a: section([link()]) }, options)).toEqual([]);
    });

    it("reports missing, unknown and malformed fields with their location", () => {
        const errors = validateContent(
            {
                a: section([
                    { type: "project-link", title: "Ohne Link" },
                    link({ maintitle: "alt" }),
                    link({ tags: "History" }),
                    link({ added: "14.11.2026" }),
                    { type: "card", title: "X" }
                ])
            },
            options
        );
        expect(errors).toEqual([
            'a.json › entries[0] "Ohne Link": missing "link"',
            'a.json › entries[1] "Titel": unknown field "maintitle" for type "project-link"',
            'a.json › entries[2] "Titel": "tags" must be a list of non-empty strings',
            'a.json › entries[3] "Titel": "added" must be an ISO date (YYYY-MM-DD)',
            expect.stringMatching(
                /^a\.json › entries\[4\] "X": unknown "type" "card"/
            )
        ]);
    });

    it("reports unknown fields on blocks and sections", () => {
        const errors = validateContent(
            {
                a: {
                    type: "collapsible",
                    id: "a",
                    heading: "A",
                    headline: "x",
                    sections: [{ title: "1", entries: [], name: "y" }]
                }
            },
            options
        );
        expect(errors).toEqual([
            'a.json: unknown field "headline"',
            'a.json › sections[0]: unknown field "name"'
        ]);
    });

    it("ignores ids of a hidden block", () => {
        const blocks = {
            a: section([link({ id: "x" })]),
            b: { type: "section", hidden: true, entries: [link({ id: "x" })] }
        };
        expect(validateContent(blocks, { placeholders: ["a", "b"] })).toEqual(
            []
        );
    });

    it("rejects duplicate ids, also against ids in the template", () => {
        const errors = validateContent(
            {
                a: section([
                    link({ id: "kasten" }),
                    link({ id: "kasten" }),
                    link({ id: "imprint" })
                ])
            },
            { ...options, templateIds: ["imprint"] }
        );
        expect(errors).toEqual([
            'a.json: id "kasten" is already used in a.json',
            'a.json: id "imprint" is already used in src/index.template.html'
        ]);
    });

    it("ignores ids of hidden entries", () => {
        const blocks = {
            a: section([link({ id: "x" }), link({ id: "x", hidden: true })])
        };
        expect(validateContent(blocks, options)).toEqual([]);
    });

    it("rejects missing images", () => {
        const story = {
            type: "project-story",
            id: "s",
            title: "S",
            images: [{ src: "assets/missing.jpg", alt: "" }]
        };
        expect(
            validateContent(
                { a: section([story]) },
                { ...options, imageExists: () => false }
            )
        ).toEqual(["a.json: image not found: assets/missing.jpg"]);
    });

    it("checks that video posters exist", () => {
        const story = {
            type: "project-story",
            id: "s",
            title: "S",
            images: [{ src: "assets/a.mp4", alt: "", poster: "assets/p.jpg" }]
        };
        expect(
            validateContent(
                { a: section([story]) },
                { ...options, imageExists: (src) => src.endsWith(".mp4") }
            )
        ).toEqual(["a.json: image not found: assets/p.jpg"]);
    });

    it("requires content files and placeholders to match", () => {
        expect(
            validateContent(
                { a: section([]), b: section([]) },
                { placeholders: ["a", "c"] }
            )
        ).toEqual([
            "template: no content/c.json for <!-- @content c -->",
            "b.json: not used - add <!-- @content b --> to src/index.template.html"
        ]);
    });
});

describe("content/", () => {
    const dir = resolve(root, "content");
    const schema = JSON.parse(readFileSync(join(dir, "schema.json"), "utf8"));
    const blocks = Object.fromEntries(
        readdirSync(dir)
            .filter((f) => f.endsWith(".json") && f !== "schema.json")
            .map((f) => {
                const { $schema, ...block } = JSON.parse(
                    readFileSync(join(dir, f), "utf8")
                );
                return [f.replace(/\.json$/, ""), block];
            })
    );
    const template = readFileSync(
        resolve(root, "src/index.template.html"),
        "utf8"
    );

    it("is valid", () => {
        expect(
            validateContent(blocks, {
                templateIds: [...template.matchAll(/\sid="([^"]+)"/g)].map(
                    (m) => m[1]
                ),
                placeholders: [...template.matchAll(PLACEHOLDER)].map(
                    (m) => m[2]
                ),
                imageExists: (src) => existsSync(resolve(root, src))
            })
        ).toEqual([]);
    });

    it("schema.json allows exactly the fields the build accepts", () => {
        const entrySchemas = schema.definitions.entry.oneOf.map(
            (ref) => schema.definitions[ref.$ref.split("/").pop()]
        );
        const fromSchema = Object.fromEntries(
            entrySchemas.map((s) => [
                s.properties.type.const,
                {
                    required: [...s.required].sort(),
                    all: Object.keys(s.properties).sort()
                }
            ])
        );
        const fromBuild = Object.fromEntries(
            Object.entries(ENTRY_FIELDS).map(([type, spec]) => [
                type,
                {
                    required: ["type", ...spec.required].sort(),
                    all: ["type", ...spec.required, ...spec.optional].sort()
                }
            ])
        );
        expect(fromSchema).toEqual(fromBuild);
    });
});
