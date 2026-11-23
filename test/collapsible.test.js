import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, settle, shadow } from "./helpers.js";

const markup = (attrs = "") => `
    <fyi-jakob-collapsible id="archive" heading="Archive" summary="years" summary-label="Projekte" ${attrs}>
        <fyi-jakob-section maintitle="2026">
            <fyi-jakob-project-text id="newest" maintitle="Newest"></fyi-jakob-project-text>
        </fyi-jakob-section>
        <fyi-jakob-section maintitle="2012">
            <fyi-jakob-project-text maintitle="Old"></fyi-jakob-project-text>
            <fyi-jakob-project-text maintitle="Older"></fyi-jakob-project-text>
        </fyi-jakob-section>
    </fyi-jakob-collapsible>
    <p id="elsewhere">outside</p>`;

const setHash = (hash) => {
    history.replaceState(null, "", hash || location.pathname);
};

describe("fyi-jakob-collapsible", () => {
    beforeEach(() => {
        setHash("");
        // Deep-link opening scrolls asynchronously; keep it from leaking.
        Element.prototype.scrollIntoView ??= () => {};
        vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(
            () => {}
        );
    });

    afterEach(() => {
        document.body.innerHTML = "";
        setHash("");
    });

    const parts = (el) => ({
        toggle: shadow(el, "button.toggle"),
        count: shadow(el, ".count"),
        teaser: shadow(el, ".teaser"),
        content: shadow(el, "#content"),
        collapse: shadow(el, ".footer-row button")
    });

    it("renders heading, entry count and teaser", async () => {
        const el = await mount(markup());
        const { toggle, count, teaser } = parts(el);

        expect(toggle.textContent).toContain("Archive");
        expect(count.textContent.trim()).toBe("3");
        expect(count.getAttribute("aria-label")).toBe("3 Einträge");
        expect(teaser.textContent).toBe(
            "Projekte von 2012 bis 2026 – zuletzt: Newest"
        );
        expect(el.count).toBe(3);
    });

    it("starts closed with aria-expanded=false and inert content", async () => {
        const el = await mount(markup());
        const { toggle, content } = parts(el);

        expect(el.open).toBe(false);
        expect(el.hasAttribute("open")).toBe(false);
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
        expect(toggle.getAttribute("aria-controls")).toBe("content");
        expect(content.hasAttribute("inert")).toBe(true);
    });

    it("toggle button opens and closes the area", async () => {
        const el = await mount(markup());

        parts(el).toggle.click();
        await el.updateComplete;
        expect(el.open).toBe(true);
        expect(el.hasAttribute("open")).toBe(true);
        expect(parts(el).toggle.getAttribute("aria-expanded")).toBe("true");
        expect(parts(el).content.hasAttribute("inert")).toBe(false);

        parts(el).toggle.click();
        await el.updateComplete;
        expect(el.open).toBe(false);
        expect(el.hasAttribute("open")).toBe(false);
        expect(parts(el).toggle.getAttribute("aria-expanded")).toBe("false");
        expect(parts(el).content.hasAttribute("inert")).toBe(true);
    });

    describe("click on the whole area", () => {
        it("opens when clicking anywhere while collapsed", async () => {
            const el = await mount(markup());
            shadow(el, ".teaser").click();
            await el.updateComplete;
            expect(el.open).toBe(true);
            expect(parts(el).toggle.getAttribute("aria-expanded")).toBe("true");
        });

        it("does not close when clicking the area while open", async () => {
            const el = await mount(markup("open"));
            el.click();
            await el.updateComplete;
            expect(el.open).toBe(true);
        });

        it("toggle button still closes (area handler doesn't reopen)", async () => {
            const el = await mount(markup("open"));
            parts(el).toggle.click();
            await el.updateComplete;
            expect(el.open).toBe(false);
        });

        it("toggle button opens exactly once", async () => {
            const el = await mount(markup());
            parts(el).toggle.click();
            await el.updateComplete;
            expect(el.open).toBe(true);
        });

        it("ignores the click when text is selected", async () => {
            const el = await mount(markup());
            const spy = vi
                .spyOn(window, "getSelection")
                .mockReturnValue({ toString: () => "Projekte" });
            el.click();
            await el.updateComplete;
            expect(el.open).toBe(false);
            spy.mockRestore();
        });
    });

    it("hides the teaser from assistive tech while open", async () => {
        const el = await mount(markup("open"));
        const teaserWrapper = parts(el).teaser.closest(".collapse");
        expect(teaserWrapper.getAttribute("aria-hidden")).toBe("true");
    });

    it("collapse button at the end closes the area", async () => {
        const el = await mount(markup("open"));
        expect(el.open).toBe(true);

        const { collapse } = parts(el);
        expect(collapse.textContent).toContain("Archive einklappen");
        collapse.click();
        await el.updateComplete;

        expect(el.open).toBe(false);
        expect(parts(el).content.hasAttribute("inert")).toBe(true);
    });

    it("uses a custom collapse-label", async () => {
        const el = await mount(markup('collapse-label="Zuklappen"'));
        expect(parts(el).collapse.textContent).toContain("Zuklappen");
    });

    describe("deep links", () => {
        it("containsHash matches its own id, descendants, and nothing else", async () => {
            const el = await mount(markup());
            expect(el.containsHash("#archive")).toBe(true);
            expect(el.containsHash("#stories")).toBe(true);
            expect(el.containsHash("#newest")).toBe(true);
            expect(el.containsHash("newest")).toBe(true);
            expect(el.containsHash("#elsewhere")).toBe(false);
            expect(el.containsHash("#missing")).toBe(false);
            expect(el.containsHash("")).toBe(false);
            expect(el.containsHash(undefined)).toBe(false);
        });

        it("opens on load when the hash targets it", async () => {
            setHash("#archive");
            const el = await mount(markup());
            expect(el.open).toBe(true);
        });

        it("opens on load when the hash targets a descendant", async () => {
            setHash("#newest");
            const el = await mount(markup());
            expect(el.open).toBe(true);
        });

        it("does not open for an unrelated hash", async () => {
            setHash("#elsewhere");
            const el = await mount(markup());
            expect(el.open).toBe(false);
        });

        it("opens on hashchange to a descendant", async () => {
            const el = await mount(markup());
            expect(el.open).toBe(false);

            setHash("#newest");
            window.dispatchEvent(new Event("hashchange"));
            await el.updateComplete;
            expect(el.open).toBe(true);
        });

        it("stays closed on hashchange to an unrelated target", async () => {
            const el = await mount(markup());
            setHash("#elsewhere");
            window.dispatchEvent(new Event("hashchange"));
            await settle();
            expect(el.open).toBe(false);
        });

        it("does not throw for a malformed percent-encoded hash", async () => {
            const el = await mount(markup());
            expect(el.containsHash("#%")).toBe(false);
            expect(el.containsHash("#%E0%A4%A")).toBe(false);
        });

        it("connects without throwing while location.hash is malformed", async () => {
            const el = await mount(markup());
            el.remove();
            setHash("#%");
            expect(() => document.body.append(el)).not.toThrow();
            expect(() =>
                window.dispatchEvent(new Event("hashchange"))
            ).not.toThrow();
        });

        it("stops listening for hashchange after disconnect", async () => {
            const el = await mount(markup());
            el.remove();
            setHash("#archive");
            window.dispatchEvent(new Event("hashchange"));
            expect(el.open).toBe(false);
        });
    });
});
