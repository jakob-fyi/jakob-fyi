/**
 * Checks the content data before it is rendered. Returns a list of readable
 * error messages (empty = valid). content/schema.json describes the same
 * rules for the editor; this file is what the build enforces.
 */

export const ENTRY_FIELDS = {
    "project-link": {
        required: ["title", "link"],
        optional: ["id", "subtitle", "tags", "time", "target", "added", "hidden"]
    },
    "project-text": {
        required: ["title"],
        optional: ["id", "subtitle", "tags", "time", "hidden"]
    },
    "project-event": {
        required: ["title"],
        optional: ["id", "subtitle", "tags", "place", "date", "time", "body", "hidden"]
    },
    "project-story": {
        required: ["id", "title", "images"],
        optional: ["subtitle", "tags", "time", "hidden"]
    },
    job: {
        required: ["title"],
        optional: ["id", "subtitle", "tagline", "link", "target", "hidden"]
    },
    link: {
        required: ["title", "link"],
        optional: ["id", "subtitle", "target", "hidden"]
    }
};

export const ENTRY_TYPES = Object.keys(ENTRY_FIELDS);

const isText = (value) => typeof value === "string" && value.trim() !== "";

const isSize = (value) => value === undefined || (Number.isInteger(value) && value > 0);
const isImage = (img) =>
    isText(img?.src) &&
    typeof img?.alt === "string" &&
    isSize(img.width) &&
    isSize(img.height) &&
    (img.poster === undefined || isText(img.poster)) &&
    Object.keys(img).every((key) => ["src", "alt", "width", "height", "poster"].includes(key));

const label = (entry) => (isText(entry?.title) ? ` "${entry.title}"` : "");

const checkField = (field, value, error) => {
    switch (field) {
        case "tags":
            if (!Array.isArray(value) || !value.every(isText)) error(`"tags" must be a list of non-empty strings`);
            break;
        case "images":
            if (!Array.isArray(value) || value.length === 0 || !value.every(isImage))
                error(`"images" must be a non-empty list of { "src", "alt", "width"?, "height"?, "poster"? }`);
            break;
        case "body":
            if (!isText(value) && !(Array.isArray(value) && value.every(isText))) error(`"body" must be an HTML string or a list of HTML strings`);
            break;
        case "hidden":
            if (typeof value !== "boolean") error(`"hidden" must be true or false`);
            break;
        case "link":
            if (!/^(https?:\/\/|mailto:)/.test(value ?? "")) error(`"link" must start with http(s):// or mailto:`);
            break;
        case "added":
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) error(`"added" must be an ISO date (YYYY-MM-DD)`);
            break;
        case "id":
            if (!/^[a-z0-9][a-z0-9-]*$/.test(value ?? "")) error(`"id" must be lowercase letters, digits and dashes`);
            break;
        default:
            if (!isText(value)) error(`"${field}" must be a non-empty string`);
    }
};

const validateEntry = (entry, where, error) => {
    const at = (msg) => error(`${where}${label(entry)}: ${msg}`);
    const spec = ENTRY_FIELDS[entry?.type];
    if (!spec) {
        at(`unknown "type" ${JSON.stringify(entry?.type)} (expected one of ${ENTRY_TYPES.join(", ")})`);
        return;
    }
    for (const field of spec.required) if (entry[field] === undefined) at(`missing "${field}"`);
    const allowed = new Set(["type", ...spec.required, ...spec.optional]);
    for (const [field, value] of Object.entries(entry)) {
        if (!allowed.has(field)) at(`unknown field "${field}" for type "${entry.type}"`);
        else if (field !== "type") checkField(field, value, at);
    }
};

const unknownKeys = (object, allowed, at) => {
    for (const key of Object.keys(object ?? {})) if (!allowed.includes(key)) at(`unknown field "${key}"`);
};

const validateSection = (section, where, error) => {
    const at = (msg) => error(`${where}: ${msg}`);
    if (section.id !== undefined) checkField("id", section.id, at);
    if (section.title !== undefined) checkField("title", section.title, at);
    if (!Array.isArray(section.entries)) return at(`"entries" must be a list`);
    section.entries.forEach((entry, i) => validateEntry(entry, `${where} › entries[${i}]`, error));
};

/** Validates one content file; `name` is used in messages. */
export const validateBlock = (block, name, error) => {
    const where = `${name}.json`;
    const at = (msg) => error(`${where}: ${msg}`);
    if (block?.hidden !== undefined) checkField("hidden", block.hidden, at);
    if (block?.type === "section") {
        unknownKeys(block, ["type", "hidden", "id", "title", "entries"], at);
        return validateSection(block, where, error);
    }
    if (block?.type !== "collapsible") return at(`"type" must be "section" or "collapsible"`);
    unknownKeys(block, ["type", "hidden", "id", "heading", "summary", "summaryLabel", "sections"], at);
    checkField("id", block.id, at);
    checkField("heading", block.heading, at);
    if (block.summary !== undefined && !["years", "groups"].includes(block.summary)) at(`"summary" must be "years" or "groups"`);
    if (block.summaryLabel !== undefined) checkField("summaryLabel", block.summaryLabel, at);
    if (!Array.isArray(block.sections)) return at(`"sections" must be a list`);
    block.sections.forEach((section, i) => {
        const at = (msg) => error(`${where} › sections[${i}]: ${msg}`);
        unknownKeys(section, ["id", "title", "entries"], at);
        validateSection(section, `${where} › sections[${i}]`, error);
    });
};

/** All ids a block puts into the page. */
const idsOf = (block) => {
    if (block.hidden) return [];
    const sections = block.type === "collapsible" ? (block.sections ?? []) : [block];
    return [
        ...(block.type === "collapsible" ? [block.id] : []),
        ...sections.flatMap((s) => [s.id, ...(s.entries ?? []).filter((e) => !e?.hidden).map((e) => e?.id)])
    ].filter(Boolean);
};

const imagesOf = (block) =>
    (block.type === "collapsible" ? (block.sections ?? []) : [block])
        .flatMap((s) => s.entries ?? [])
        .flatMap((e) => (Array.isArray(e?.images) ? e.images : []))
        .flatMap((img) => [img?.src, img?.poster])
        .filter(isText);

/**
 * Validates all blocks together.
 * @param {Record<string, object>} blocks content file name -> data
 * @param {object} options
 * @param {string[]} options.templateIds ids already present in the template
 * @param {string[]} options.placeholders placeholder names used in the template
 * @param {(src: string) => boolean} options.imageExists
 * @returns {string[]} error messages
 */
export const validateContent = (blocks, { templateIds = [], placeholders = [], imageExists = () => true } = {}) => {
    const errors = [];
    const error = (msg) => errors.push(msg);

    for (const [name, block] of Object.entries(blocks)) validateBlock(block, name, error);

    const names = Object.keys(blocks);
    for (const name of placeholders) if (!names.includes(name)) error(`template: no content/${name}.json for <!-- @content ${name} -->`);
    for (const name of names)
        if (!placeholders.includes(name)) error(`${name}.json: not used - add <!-- @content ${name} --> to src/index.template.html`);

    if (errors.length) return errors;

    const seen = new Map(templateIds.map((id) => [id, "src/index.template.html"]));
    for (const [name, block] of Object.entries(blocks)) {
        for (const id of idsOf(block)) {
            if (seen.has(id)) error(`${name}.json: id "${id}" is already used in ${seen.get(id)}`);
            else seen.set(id, `${name}.json`);
        }
        for (const src of imagesOf(block)) if (!imageExists(src)) error(`${name}.json: image not found: ${src}`);
    }
    return errors;
};
