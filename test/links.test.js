import { afterEach, describe, expect, it } from "vitest";
import { relFor } from "../src/components/feature/link-utils.js";
import { mount, shadow } from "./helpers.js";

afterEach(() => {
    document.body.innerHTML = "";
});

describe("relFor", () => {
    it("adds noopener noreferrer only for _blank", () => {
        expect(relFor("_blank")).toBe("noopener noreferrer");
        expect(typeof relFor("_self")).not.toBe("string");
        expect(typeof relFor(undefined)).not.toBe("string");
    });
});

describe("fyi-jakob-project-link", () => {
    it("renders a real anchor opening in a new tab by default", async () => {
        const el = await mount(
            `<fyi-jakob-project-link maintitle="Project" link="https://example.org" tags='["A"]' time="2024"></fyi-jakob-project-link>`
        );
        const a = shadow(el, "a");
        expect(a).toBeInstanceOf(HTMLAnchorElement);
        expect(a.getAttribute("href")).toBe("https://example.org");
        expect(a.getAttribute("target")).toBe("_blank");
        expect(a.getAttribute("rel")).toBe("noopener noreferrer");
        expect(
            shadow(a.querySelector("fyi-jakob-titles"), ".main-title")
                .textContent
        ).toBe("Project");
    });

    it("omits rel for same-tab targets", async () => {
        const el = await mount(
            `<fyi-jakob-project-link link="/page" target="_self"></fyi-jakob-project-link>`
        );
        const a = shadow(el, "a");
        expect(a.getAttribute("target")).toBe("_self");
        expect(a.hasAttribute("rel")).toBe(false);
    });
});

describe("fyi-jakob-job", () => {
    it("renders an anchor when a link is set", async () => {
        const el = await mount(
            `<fyi-jakob-job maintitle="AppArtig" tagline="seit 2013" link="https://www.appartig.at"></fyi-jakob-job>`
        );
        const a = shadow(el, "a.wrapper");
        expect(a.getAttribute("href")).toBe("https://www.appartig.at");
        expect(a.getAttribute("target")).toBe("_blank");
        expect(a.getAttribute("rel")).toBe("noopener noreferrer");
        expect(shadow(el, "fyi-jakob-meta-item").textContent).toBe("seit 2013");
    });

    it("renders a plain div without a link", async () => {
        const el = await mount(
            `<fyi-jakob-job maintitle="Land NÖ"></fyi-jakob-job>`
        );
        expect(shadow(el, "a")).toBeNull();
        expect(shadow(el, "div.wrapper")).not.toBeNull();
    });

    it("omits rel for a custom non-blank target", async () => {
        const el = await mount(
            `<fyi-jakob-job link="https://x.org" target="_self"></fyi-jakob-job>`
        );
        expect(shadow(el, "a").hasAttribute("rel")).toBe(false);
    });
});

describe("fyi-jakob-link", () => {
    it("opens http(s) links in a new tab with rel", async () => {
        const el = await mount(
            `<fyi-jakob-link link="https://github.com/x" maintitle="GitHub"></fyi-jakob-link>`
        );
        const a = shadow(el, "a");
        expect(a.getAttribute("href")).toBe("https://github.com/x");
        expect(a.getAttribute("target")).toBe("_blank");
        expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("forces _self and no rel for mailto links", async () => {
        const el = await mount(
            `<fyi-jakob-link link="mailto:contact@jakob.fyi" maintitle="Mail"></fyi-jakob-link>`
        );
        const a = shadow(el, "a");
        expect(a.getAttribute("href")).toBe("mailto:contact@jakob.fyi");
        expect(a.getAttribute("target")).toBe("_self");
        expect(a.hasAttribute("rel")).toBe(false);
    });

    it("forces _self even if target=_blank is set explicitly on a mailto link", async () => {
        const el = await mount(
            `<fyi-jakob-link link="mailto:a@b.c" target="_blank"></fyi-jakob-link>`
        );
        expect(shadow(el, "a").getAttribute("target")).toBe("_self");
    });
});
