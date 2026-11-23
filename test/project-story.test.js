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
            .forEach((el) => el.open && el.close({ fromHistory: true }));
        document.body.innerHTML = "";
        document.documentElement.style.overflow = "";
        history.replaceState(null, "", location.pathname + location.search);
        vi.restoreAllMocks();
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
        const dialog = shadow(el, "dialog");
        expect(dialog.open).toBe(false);

        shadow(el, "button.card").click();
        await el.updateComplete;
        expect(el.open).toBe(true);
        expect(el.hasAttribute("open")).toBe(true);
        expect(dialog.open).toBe(true);
        expect(document.documentElement.style.overflow).toBe("hidden");

        el.close();
        await el.updateComplete;
        expect(el.open).toBe(false);
        expect(dialog.open).toBe(false);
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
            clickFrom(el.images[2], shadow(el, "#viewport"));
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
        it("adds keydown on open and removes it on close", async () => {
            const add = vi.spyOn(window, "addEventListener");
            const remove = vi.spyOn(window, "removeEventListener");
            const el = await mountStory();

            await openStory(el);
            expect(add).toHaveBeenCalledWith("keydown", el._onKeyDown);

            el.close();
            expect(remove).toHaveBeenCalledWith("keydown", el._onKeyDown);
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

    describe("bottom bar", () => {
        it("shows caption and counter and the navigation", async () => {
            const el = await mountStory();
            await openStory(el);
            el.move(2);
            await el.updateComplete;
            const bar = shadow(el, ".bar");
            expect(bar.querySelector(".caption").textContent.trim()).toBe("3");
            expect(bar.querySelector(".counter").textContent.trim()).toBe(
                "3 / 4"
            );
            expect(
                [...bar.querySelectorAll("button")].map((b) =>
                    b.getAttribute("aria-label")
                )
            ).toEqual([
                "Vorheriges Bild",
                "Nächstes Bild",
                "Galerie schließen"
            ]);
        });

        it("omits the caption for images without alt text", async () => {
            const el = await mount(`
                <fyi-jakob-project-story maintitle="Ohne Alt">
                    <img src="data:," alt="" />
                </fyi-jakob-project-story>`);
            shadow(el, "slot").dispatchEvent(new Event("slotchange"));
            await el.updateComplete;
            expect(shadow(el, ".caption")).toBeNull();
            expect(shadow(el, ".counter").textContent.trim()).toBe("1 / 1");
        });

        it("has no toggle for the controls any more", async () => {
            const el = await mountStory();
            expect(shadow(el, ".toggle-controls, .show-controls")).toBeNull();
            expect(el.toggleControls).toBeUndefined();
        });

        it("does nothing when the current image is clicked", async () => {
            const el = await mountStory();
            await openStory(el);
            const move = vi.spyOn(el, "move");
            clickFrom(el.images[0], shadow(el, "#viewport"));
            expect(move).toHaveBeenCalledWith(0);
            expect(el.currentIndex).toBe(0);
            expect(el.open).toBe(true);
        });
    });

    describe("robustness", () => {
        it("restores the previous page overflow value on close", async () => {
            document.documentElement.style.overflow = "clip";
            const el = await mountStory();
            await openStory(el);
            expect(document.documentElement.style.overflow).toBe("hidden");
            el.close();
            expect(document.documentElement.style.overflow).toBe("clip");
        });

        it("ignores close() while already closed", async () => {
            const el = await mountStory();
            const back = vi.spyOn(history, "back");
            el.close();
            expect(back).not.toHaveBeenCalled();
            expect(el.open).toBe(false);
        });

        it("opens only once when openGallery() is called twice", async () => {
            const el = await mountStory();
            const push = vi.spyOn(history, "pushState");
            el.id = "twice";
            el.openGallery();
            el.openGallery();
            expect(push).toHaveBeenCalledTimes(1);
        });

        it("syncs state when the dialog is closed natively", async () => {
            const el = await mountStory();
            await openStory(el);
            shadow(el, "dialog").close();
            shadow(el, "dialog").dispatchEvent(new Event("close"));
            expect(el.open).toBe(false);
            expect(document.documentElement.style.overflow).toBe("");
        });

        it("re-centres when an image finishes loading", async () => {
            const el = await mountStory();
            await openStory(el);
            const scrollTo = vi.spyOn(el, "_scrollTo");
            el.images[0].dispatchEvent(new Event("load"));
            expect(scrollTo).toHaveBeenCalledWith(0, false);
        });

        it("does not re-centre on image load while closed", async () => {
            const el = await mountStory();
            const scrollTo = vi.spyOn(el, "_scrollTo");
            el.images[0].dispatchEvent(new Event("load"));
            expect(scrollTo).not.toHaveBeenCalled();
        });

        it("ignores arrow keys with modifiers (browser shortcuts)", async () => {
            const el = await mountStory();
            await openStory(el);
            const event = new KeyboardEvent("keydown", {
                key: "ArrowLeft",
                altKey: true,
                cancelable: true
            });
            el.move(2);
            window.dispatchEvent(event);
            expect(el.currentIndex).toBe(2);
            expect(event.defaultPrevented).toBe(false);
        });
    });

    describe("keyboard extras", () => {
        it("jumps to the first and last image with Home/End", async () => {
            const el = await mountStory();
            await openStory(el);
            key("End");
            expect(el.currentIndex).toBe(3);
            key("Home");
            expect(el.currentIndex).toBe(0);
        });
    });

    describe("accessibility", () => {
        it("labels the dialog with the visible title", async () => {
            const el = await mountStory();
            const dialog = shadow(el, "dialog");
            const title = el.shadowRoot.getElementById(
                dialog.getAttribute("aria-labelledby")
            );
            expect(title.textContent.trim()).toBe("Bücherregal");
        });

        it("hides inactive images from assistive technology", async () => {
            const el = await mountStory();
            el.move(1);
            expect(
                el.images.map((img) => img.getAttribute("aria-hidden"))
            ).toEqual(["true", null, "true", "true"]);
        });

        it("shows the alt text as caption and announces position", async () => {
            const el = await mountStory();
            await openStory(el);
            el.move(2);
            await el.updateComplete;
            expect(shadow(el, ".caption").textContent.trim()).toBe("3");
            expect(shadow(el, "[aria-live]").textContent.trim()).toBe(
                "Bild 3 von 4: 3"
            );
        });

        it("announces nothing while closed", async () => {
            const el = await mountStory();
            await el.updateComplete;
            expect(shadow(el, "[aria-live]").textContent.trim()).toBe("");
        });
    });

    describe("card", () => {
        it("shows the first image as thumbnail with the image count", async () => {
            const el = await mountStory();
            await el.updateComplete;
            expect(shadow(el, ".thumb img")).not.toBeNull();
            expect(shadow(el, ".thumb-count").textContent.trim()).toBe("4");
            expect(shadow(el, ".thumb .visually-hidden").textContent).toContain(
                "4 Bildern"
            );
        });

        it("falls back to the icon without images", async () => {
            const el = await mount(
                `<fyi-jakob-project-story maintitle="Leer"></fyi-jakob-project-story>`
            );
            expect(shadow(el, ".thumb")).toBeNull();
            expect(shadow(el, ".aside-icon")).not.toBeNull();
        });
    });

    describe("preloading", () => {
        it("keeps images lazy while closed", async () => {
            const el = await mount(
                markup.replaceAll("<img ", '<img loading="lazy" ')
            );
            shadow(el, "slot").dispatchEvent(new Event("slotchange"));
            expect(el.images.map((img) => img.loading)).toEqual([
                "lazy",
                "lazy",
                "lazy",
                "lazy"
            ]);
        });

        it("loads the current image and its neighbours eagerly when open", async () => {
            const el = await mount(
                markup.replaceAll("<img ", '<img loading="lazy" ')
            );
            shadow(el, "slot").dispatchEvent(new Event("slotchange"));
            await openStory(el);
            el.move(2);
            expect(el.images.map((img) => img.loading)).toEqual([
                "eager",
                "eager",
                "eager",
                "eager"
            ]);
        });

        it("only preloads one behind and two ahead", async () => {
            const el = await mount(
                markup.replaceAll("<img ", '<img loading="lazy" ')
            );
            shadow(el, "slot").dispatchEvent(new Event("slotchange"));
            await openStory(el);
            expect(el.images.map((img) => img.loading)).toEqual([
                "eager",
                "eager",
                "eager",
                "lazy"
            ]);
        });
    });

    describe("history and deep links", () => {
        const mountWithId = async () => {
            const el = await mountStory();
            el.id = "regal";
            return el;
        };

        it("pushes #id when opened and goes back when closed", async () => {
            const el = await mountWithId();
            const back = vi.spyOn(history, "back").mockImplementation(() => {});
            await openStory(el);
            expect(location.hash).toBe("#regal");
            el.close();
            expect(back).toHaveBeenCalledTimes(1);
        });

        it("closes without touching history when the user navigates back", async () => {
            const el = await mountWithId();
            const back = vi.spyOn(history, "back");
            await openStory(el);
            history.replaceState(null, "", location.pathname);
            window.dispatchEvent(new PopStateEvent("popstate"));
            await settle();
            expect(el.open).toBe(false);
            expect(back).not.toHaveBeenCalled();
        });

        it("opens when the hash points at it", async () => {
            const el = await mountWithId();
            const push = vi.spyOn(history, "pushState");
            history.replaceState(null, "", "#regal");
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            await settle();
            expect(el.open).toBe(true);
            expect(push).not.toHaveBeenCalled();
        });

        it("removes the deep-link hash on close instead of leaving the page", async () => {
            const el = await mountWithId();
            const back = vi.spyOn(history, "back");
            history.replaceState(null, "", "#regal");
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            await settle();
            el.close();
            expect(back).not.toHaveBeenCalled();
            expect(location.hash).toBe("");
        });

        it("ignores hashes of other elements", async () => {
            const el = await mountWithId();
            history.replaceState(null, "", "#other");
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            await settle();
            expect(el.open).toBe(false);
        });

        it("stops listening for hash changes when disconnected", async () => {
            const el = await mountWithId();
            el.remove();
            history.replaceState(null, "", "#regal");
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            await settle();
            expect(el.open).toBe(false);
        });
    });
});
