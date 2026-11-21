import { html, render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { jsonArray, renderTags } from "../src/components/ui/tags.js";

const renderInto = (template) => {
    const container = document.createElement("div");
    render(template, container);
    return [...container.querySelectorAll("fyi-jakob-meta-item")];
};

describe("jsonArray converter", () => {
    it("parses a JSON array", () => {
        expect(jsonArray.fromAttribute('["History", "Event"]')).toEqual([
            "History",
            "Event"
        ]);
    });

    it.each([null, undefined, ""])("returns [] for empty value %j", (value) => {
        expect(jsonArray.fromAttribute(value)).toEqual([]);
    });

    it("returns [] for non-array JSON", () => {
        expect(jsonArray.fromAttribute('{"a": 1}')).toEqual([]);
        expect(jsonArray.fromAttribute('"History"')).toEqual([]);
    });

    it("never throws on malformed JSON and warns instead", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(() =>
            jsonArray.fromAttribute("['single quotes']")
        ).not.toThrow();
        expect(jsonArray.fromAttribute("[broken")).toEqual([]);
        expect(warn).toHaveBeenCalled();
    });
});

describe("renderTags", () => {
    it("renders one meta item per tag in the meta slot", () => {
        const items = renderInto(renderTags(["History", "Event"]));
        expect(items.map((i) => i.textContent)).toEqual(["History", "Event"]);
        expect(items.every((i) => i.getAttribute("slot") === "meta")).toBe(
            true
        );
    });

    it("appends the time as an extra tag", () => {
        const items = renderInto(renderTags(["History"], "2025"));
        expect(items.map((i) => i.textContent)).toEqual(["History", "2025"]);
    });

    it("handles missing tags and missing time", () => {
        expect(renderInto(renderTags(undefined))).toHaveLength(0);
        expect(
            renderInto(renderTags(null, "2024")).map((i) => i.textContent)
        ).toEqual(["2024"]);
    });

    it("omits the slot attribute when slot is `nothing`", async () => {
        const { nothing } = await import("lit");
        const items = renderInto(html`${renderTags(["A"], "2020", nothing)}`);
        expect(items).toHaveLength(2);
        expect(items.some((i) => i.hasAttribute("slot"))).toBe(false);
    });
});
