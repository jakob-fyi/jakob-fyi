import { afterEach, describe, expect, it } from "vitest";
import { clickFrom, mount, shadow } from "./helpers.js";

const withDetails = `
    <fyi-jakob-project-event maintitle="Lecture" subtitle="Sub" date="Mi 7.1." time="13:00" place="London" tags='["Event"]'>
        <p>Details <a id="inner-link" href="https://example.org" target="_blank" rel="noopener noreferrer">Website</a></p>
    </fyi-jakob-project-event>`;

const withoutDetails = `<fyi-jakob-project-event maintitle="Lecture"></fyi-jakob-project-event>`;

const card = (el) => shadow(el, "fyi-jakob-item");
const toggleButton = (el) => shadow(el, "button.toggle");
const detailsContainer = (el) => shadow(el, ".collapse");

describe("fyi-jakob-project-event", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("renders date | time and place", async () => {
        const el = await mount(withDetails);
        expect(shadow(el, ".datetime").textContent).toBe("Mi 7.1. | 13:00");
        expect(shadow(el, ".place").textContent).toBe("London");
    });

    it("starts collapsed with inert details", async () => {
        const el = await mount(withDetails);
        expect(el.expanded).toBe(false);
        expect(detailsContainer(el).hasAttribute("inert")).toBe(true);
        expect(toggleButton(el).getAttribute("aria-expanded")).toBe("false");
        expect(toggleButton(el).getAttribute("aria-controls")).toBe(
            detailsContainer(el).id
        );
    });

    it("toggles when the card is clicked", async () => {
        const el = await mount(withDetails);

        card(el).click();
        await el.updateComplete;
        expect(el.expanded).toBe(true);
        expect(el.hasAttribute("expanded")).toBe(true);
        expect(detailsContainer(el).hasAttribute("inert")).toBe(false);
        expect(toggleButton(el).getAttribute("aria-expanded")).toBe("true");
        expect(toggleButton(el).getAttribute("aria-label")).toBe(
            "Details ausblenden"
        );

        card(el).click();
        await el.updateComplete;
        expect(el.expanded).toBe(false);
        expect(detailsContainer(el).hasAttribute("inert")).toBe(true);
        expect(toggleButton(el).getAttribute("aria-label")).toBe(
            "Details anzeigen"
        );
    });

    it("toggles via the toggle button (click bubbles to the card exactly once)", async () => {
        const el = await mount(withDetails);
        toggleButton(el).click();
        await el.updateComplete;
        expect(el.expanded).toBe(true);
    });

    it("ignores clicks on links inside the details", async () => {
        const el = await mount(withDetails);
        el.expanded = true;
        await el.updateComplete;

        clickFrom(el.querySelector("#inner-link"), card(el));
        await el.updateComplete;
        expect(el.expanded).toBe(true);
    });

    it("toggles when clicking non-link slotted content", async () => {
        const el = await mount(withDetails);
        clickFrom(el.querySelector("p"), card(el));
        await el.updateComplete;
        expect(el.expanded).toBe(true);
    });

    it("has no toggle button and does not expand without child elements", async () => {
        const el = await mount(withoutDetails);
        expect(toggleButton(el)).toBeNull();

        card(el).click();
        await el.updateComplete;
        expect(el.expanded).toBe(false);
    });

    it("gives each instance a unique details id", async () => {
        await mount(withDetails + withDetails);
        const [a, b] = document.querySelectorAll("fyi-jakob-project-event");
        expect(detailsContainer(a).id).not.toBe(detailsContainer(b).id);
    });
});
