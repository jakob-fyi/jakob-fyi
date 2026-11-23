#!/usr/bin/env node
/**
 * Migration helper: splits a hand-written index.html into
 * src/index.template.html + content/*.json.
 *
 *   node scripts/extract-content.mjs [path/to/index.html]
 *
 * Defaults to src/index.html. Use it again when a branch that still edits
 * index.html by hand is merged: extract from that version, then rebuild.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(resolve(process.argv[2] ?? join(root, "src/index.html")), "utf8");

/** Blocks that become content files: file name -> [tag, id]. */
const BLOCKS = {
    featured: ["fyi-jakob-section", "featured"],
    "long-term": ["fyi-jakob-section", "long-term"],
    archive: ["fyi-jakob-collapsible", "archive"],
    stories: ["fyi-jakob-collapsible", "stories"],
    recommendations: ["fyi-jakob-collapsible", "recommendations"],
    jobs: ["fyi-jakob-section", "jobs"],
    contact: ["fyi-jakob-section", "contact"]
};

const window = new Window();
const doc = new window.DOMParser().parseFromString(source, "text/html");

const attr = (el, name) => el.getAttribute(name) ?? undefined;
/** One line per top-level element; drops whitespace that has no visible effect. */
const collapse = (html) =>
    html
        .replace(/<!--.*?-->/gs, "")
        .replace(/\s+/g, " ")
        .replace(/(<[a-z][^>]*>) /gi, "$1")
        .replace(/ (<\/[a-z]+>)/gi, "$1")
        .trim();

const toEntry = (el) => {
    const type = el.localName.replace(/^fyi-jakob-/, "");
    const entry = {
        type,
        id: attr(el, "id"),
        title: attr(el, "maintitle"),
        subtitle: attr(el, "subtitle"),
        tags: el.hasAttribute("tags") ? JSON.parse(el.getAttribute("tags")) : undefined,
        place: attr(el, "place"),
        date: attr(el, "date"),
        time: attr(el, "time"),
        tagline: attr(el, "tagline"),
        link: attr(el, "link"),
        target: attr(el, "target"),
        added: attr(el, "added")
    };
    if (type === "project-story") {
        entry.images = [...el.querySelectorAll("img")].map((img) => ({
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") ?? "",
            width: img.hasAttribute("width") ? Number(img.getAttribute("width")) : undefined,
            height: img.hasAttribute("height") ? Number(img.getAttribute("height")) : undefined
        }));
    } else {
        const body = [...el.childNodes]
            .map((node) => (node.nodeType === 1 ? collapse(node.outerHTML) : node.nodeType === 3 ? node.textContent.trim() : ""))
            .filter(Boolean);
        if (body.length) entry.body = body;
    }
    return JSON.parse(JSON.stringify(entry)); // drops undefined fields
};

const toSection = (el, withId) => ({
    ...(withId && el.id ? { id: el.id } : {}),
    ...(el.hasAttribute("maintitle") ? { title: el.getAttribute("maintitle") } : {}),
    entries: [...el.children].map(toEntry)
});

const toBlock = (el) =>
    el.localName === "fyi-jakob-collapsible"
        ? {
              $schema: "./schema.json",
              type: "collapsible",
              id: el.id,
              heading: attr(el, "heading"),
              ...(el.hasAttribute("summary") ? { summary: el.getAttribute("summary") } : {}),
              ...(el.hasAttribute("summary-label") ? { summaryLabel: el.getAttribute("summary-label") } : {}),
              sections: [...el.children].map((s) => {
                  if (s.localName !== "fyi-jakob-section")
                      throw new Error(
                          `#${el.id}: <${s.localName} maintitle="${s.getAttribute("maintitle")}"> is not inside a fyi-jakob-section - move it into one first`
                      );
                  return toSection(s, true);
              })
          }
        : { $schema: "./schema.json", type: "section", ...toSection(el, true) };

/** Source range of the element `<tag … id="id">…</tag>`, honouring nesting. */
const rangeOf = (text, tag, id) => {
    const open = new RegExp(`<${tag}\\b[^>]*\\bid="${id}"[^>]*>`).exec(text);
    if (!open) throw new Error(`<${tag} id="${id}"> not found`);
    const token = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, "g");
    token.lastIndex = open.index + open[0].length;
    for (let depth = 1, m; (m = token.exec(text));) {
        depth += m[0].startsWith("</") ? -1 : 1;
        if (depth === 0) return [open.index, m.index + m[0].length];
    }
    throw new Error(`<${tag} id="${id}"> is not closed`);
};

/**
 * A block that is commented out as a whole (`<!-- <fyi-jakob-… id="x"> … -->`)
 * becomes a content file with `"hidden": true`.
 */
const commentedOut = (text, tag, id) => {
    const match = new RegExp(`<!--\\s*(<${tag}\\b[^>]*\\bid="${id}"[\\s\\S]*?)-->`).exec(text);
    if (!match) return null;
    const el = new window.DOMParser().parseFromString(match[1], "text/html").getElementById(id);
    return { el, range: [match.index, match.index + match[0].length] };
};

let template = source;
mkdirSync(join(root, "content"), { recursive: true });
for (const [name, [tag, id]] of Object.entries(BLOCKS)) {
    let block, range;
    const el = doc.getElementById(id);
    if (el) {
        block = toBlock(el);
        range = rangeOf(template, tag, id);
    } else {
        const hidden = commentedOut(template, tag, id);
        if (!hidden) throw new Error(`#${id} not found`);
        const { $schema, type, ...rest } = toBlock(hidden.el);
        block = { $schema, type, hidden: true, ...rest };
        range = hidden.range;
    }
    writeFileSync(join(root, "content", `${name}.json`), JSON.stringify(block, null, 4) + "\n");
    template = `${template.slice(0, range[0])}<!-- @content ${name} -->${template.slice(range[1])}`;
}
// Drop a notice from a previous generator run.
template = template.replace(/^<!-- Generated by scripts\/build-html\.mjs.*-->\n/m, "");
writeFileSync(join(root, "src/index.template.html"), template);
console.log(`Extracted ${Object.keys(BLOCKS).length} blocks into content/ and src/index.template.html`);
