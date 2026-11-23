#!/usr/bin/env node
/**
 * Generates src/index.html from src/index.template.html and content/*.json.
 *
 *   node scripts/build-html.mjs           build once (exit code 1 on errors)
 *   node scripts/build-html.mjs --watch   rebuild whenever content or template change
 */
import { existsSync, readdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PLACEHOLDER, renderPage } from "./content/render.mjs";
import { validateContent } from "./content/validate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(root, "content");
const SRC_DIR = join(root, "src");
const TEMPLATE = join(SRC_DIR, "index.template.html");
const OUTPUT = join(SRC_DIR, "index.html");

const readJson = (file) => {
    try {
        return JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
        throw new Error(`${file.slice(root.length + 1)}: ${e.message}`);
    }
};

const loadBlocks = () =>
    Object.fromEntries(
        readdirSync(CONTENT_DIR)
            .filter((f) => f.endsWith(".json") && f !== "schema.json")
            .sort()
            .map((f) => {
                const { $schema, ...block } = readJson(join(CONTENT_DIR, f));
                return [f.replace(/\.json$/, ""), block];
            })
    );

/** Builds the page; returns the list of errors (nothing is written then). */
export const build = () => {
    let template, blocks;
    try {
        template = readFileSync(TEMPLATE, "utf8");
        blocks = loadBlocks();
    } catch (e) {
        return [e.message];
    }

    const errors = validateContent(blocks, {
        templateIds: [...template.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
        placeholders: [...template.matchAll(PLACEHOLDER)].map((m) => m[2]),
        imageExists: (src) => existsSync(join(SRC_DIR, src))
    });
    if (errors.length) return errors;

    const page = renderPage(template, blocks);
    const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf8") : null;
    // Only write on change, so Parcel does not reload for nothing.
    if (page !== current) writeFileSync(OUTPUT, page);
    return [];
};

const report = (errors) => {
    const time = new Date().toLocaleTimeString();
    if (errors.length === 0) {
        console.log(`[content] ${time} src/index.html generated`);
        return true;
    }
    console.error(`[content] ${time} src/index.html NOT updated:`);
    for (const e of errors) console.error(`  ✗ ${e}`);
    return false;
};

if (process.argv.includes("--watch")) {
    report(build());
    let timer;
    const rebuild = () => {
        clearTimeout(timer);
        timer = setTimeout(() => report(build()), 50);
    };
    // Directories, not files: editors that save via rename would end a file watch.
    watch(CONTENT_DIR, rebuild);
    watch(SRC_DIR, (_, file) => file === "index.template.html" && rebuild());
    console.log("[content] watching content/ and src/index.template.html");
} else if (!report(build())) {
    process.exit(1);
}
