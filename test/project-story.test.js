import { afterEach, describe, expect, it, vi } from "vitest";
import { clickFrom, mount, settle, shadow } from "./helpers.js";

const markup = `
    <fyi-jakob-project-story maintitle="Bücherregal" subtitle="Esche" tags='["Carpentry"]' time="2024">
        <img src="data:," alt="1" />
        <img src="data:," alt="2" />
        <img src="data:," alt="3" />
        <img src="data:," alt="4" />
    </fyi-jakob-project-story>`;

const key = (k) =>
    window.dispatchEvent(
        new KeyboardEvent("keydown", { key: k, cancelable: true })
    );
const nextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(() => resolve()));

const mountStory = async () => {
    const el = await mount(markup);
    // Browsers fire `slotchange` when the slot is first rendered with assigned
    // nodes; happy-dom does not, so simulate it once.
    shadow(el, "slot").dispatchEvent(new Event("slotchange"));
    return el;
};

const openStory = async (el) => {
    el.openGallery();
    await el.updateComplete;
    await nextFrame();
    await settle();
};

describe("fyi-jakob-project-story", () => {
    afterEach(() => {
        document
            .querySelectorAll("fyi-jakob-project-story")
            .forEach((el) => el.open && el.close());
        document.body.innerHTML = "";
    });

    it("collects slotted images and marks the first one active", async () => {
        const el = await mountStory();
        expect(el.images).toHaveLength(4);
        expect(el.images.map((img) => img.dataset.index)).toEqual([
            "0",
            "1",
            "2",
            "3"
        ]);
        expect(el.images[0].classList.contains("active")).toBe(true);
    });

    it("opens the gallery when the card is clicked and closes via close()", async () => {
        const el = await mountStory();
        const dialog = shadow(el, '[role="dialog"]');
        expect(dialog.hidden).toBe(true);

        shadow(el, "button.card").click();
        await el.updateComplete;
        expect(el.open).toBe(true);
        expect(el.hasAttribute("open")).toBe(true);
        expect(shadow(el, '[role="dialog"]').hidden).toBe(false);
        expect(document.documentElement.style.overflow).toBe("hidden");

        el.close();
        await el.updateComplete;
        expect(el.open).toBe(false);
        expect(shadow(el, '[role="dialog"]').hidden).toBe(true);
        expect(document.documentElement.style.overflow).toBe("");
    });

    describe("move()", () => {
        it("coerces string indices to numbers", async () => {
            const el = await mountStory();
            el.move("1");
            expect(el.currentIndex).toBe(1);
            el.forward();
            expect(el.currentIndex).toBe(2); // not "11"
            expect(el.images[2].classList.contains("active")).toBe(true);
            expect(
                el.images.filter((img) => img.classList.contains("active"))
            ).toHaveLength(1);
        });

        it.each([-1, 4, 99, 1.5, NaN, "abc"])(
            "ignores invalid index %j",
            async (index) => {
                const el = await mountStory();
                el.move(2);
                el.move(index);
                expect(el.currentIndex).toBe(2);
            }
        );

        it("does not go past either end with forward/backward", async () => {
            const el = await mountStory();
            el.backward();
            expect(el.currentIndex).toBe(0);
            el.move(3);
            el.forward();
            expect(el.currentIndex).toBe(3);
        });

        it("renders the counter as soon as images are slotted", async () => {
            const el = await mountStory();
            await el.updateComplete;
            expect(shadow(el, ".counter").textContent.trim()).toBe("1 / 4");
            expect(shadow(el, '[aria-label="Nächstes Bild"]').disabled).toBe(
                false
            );
        });

        it("updates the counter and disables the boundary buttons", async () => {
            const el = await mountStory();
            await openStory(el);
            const prev = () => shadow(el, '[aria-label="Vorheriges Bild"]');
            const next = () => shadow(el, '[aria-label="Nächstes Bild"]');
            expect(shadow(el, ".counter").textContent.trim()).toBe("1 / 4");
            expect(prev().disabled).toBe(true);
            expect(next().disabled).toBe(false);

            el.move(3);
            await el.updateComplete;
            expect(shadow(el, ".counter").textContent.trim()).toBe("4 / 4");
            expect(prev().disabled).toBe(false);
            expect(next().disabled).toBe(true);
        });

        it("moves to an image when it is clicked", async () => {
            const el = await mountStory();
            clickFrom(el.images[2], shadow(el, "#images"));
            expect(el.currentIndex).toBe(2);
        });
    });

    describe("keyboard", () => {
        it("is ignored while the gallery is closed", async () => {
            const el = await mountStory();
            key("ArrowRight");
            expect(el.currentIndex).toBe(0);
        });

        it("navigates with arrow keys while open", async () => {
            const el = await mountStory();
            await openStory(el);

            key("ArrowRight");
            key("ArrowRight");
            expect(el.currentIndex).toBe(2);
            key("ArrowLeft");
            expect(el.currentIndex).toBe(1);
        });

        it("prevents default only for handled keys", async () => {
            const el = await mountStory();
            await openStory(el);

            const handled = new KeyboardEvent("keydown", {
                key: "ArrowRight",
                cancelable: true
            });
            const other = new KeyboardEvent("keydown", {
                key: "a",
                cancelable: true
            });
            window.dispatchEvent(handled);
            window.dispatchEvent(other);
            expect(handled.defaultPrevented).toBe(true);
            expect(other.defaultPrevented).toBe(false);
        });

        it("closes with Escape", async () => {
            const el = await mountStory();
            await openStory(el);
            key("Escape");
            expect(el.open).toBe(false);
        });

        it("has no effect after the gallery was closed", async () => {
            const el = await mountStory();
            await openStory(el);
            el.move(1);
            el.close();

            const forward = vi.spyOn(el, "forward");
            el.open = true; // even if state were stale, the listener must be gone
            key("ArrowRight");
            expect(forward).not.toHaveBeenCalled();
            expect(el.currentIndex).toBe(1);
            el.open = false;
        });
    });

    describe("global listeners", () => {
        it("adds keydown/resize on open and removes them on close", async () => {
            const add = vi.spyOn(window, "addEventListener");
            const remove = vi.spyOn(window, "removeEventListener");
            const el = await mountStory();

            await openStory(el);
            expect(add).toHaveBeenCalledWith("keydown", el._onKeyDown);
            expect(add).toHaveBeenCalledWith("resize", el._onResize);

            el.close();
            expect(remove).toHaveBeenCalledWith("keydown", el._onKeyDown);
            expect(remove).toHaveBeenCalledWith("resize", el._onResize);
        });

        it("removes them when disconnected while open", async () => {
            const remove = vi.spyOn(window, "removeEventListener");
            const el = await mountStory();
            await openStory(el);
            el.move(1);

            el.remove();
            expect(remove).toHaveBeenCalledWith("keydown", el._onKeyDown);
            key("ArrowRight");
            expect(el.currentIndex).toBe(1);
            document.documentElement.style.overflow = "";
        });

        it("restores page scrolling when disconnected while open", async () => {
            const el = await mountStory();
            await openStory(el);
            try {
                el.remove();
                expect(document.documentElement.style.overflow).toBe("");
            } finally {
                document.documentElement.style.overflow = "";
            }
        });
    });

    it("toggles between container and inline mode", async () => {
        const el = await mountStory();
        const modeButton = () => shadow(el, "[aria-pressed]");
        expect(
            shadow(el, ".fullscreen").classList.contains("mode-container")
        ).toBe(true);
        expect(modeButton().getAttribute("aria-pressed")).toBe("false");

        modeButton().click();
        await el.updateComplete;
        expect(el.inlineMode).toBe(true);
        expect(
            shadow(el, ".fullscreen").classList.contains("mode-inline")
        ).toBe(true);
        expect(modeButton().getAttribute("aria-pressed")).toBe("true");
    });
});
