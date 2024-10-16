import Typed from "typed.js";
import { Event } from "../components/event/event";
import { Item } from "../components/item/item";

window.toggleTheme = () => {
    document.body.classList.toggle("dark");
};

window.toggleImpressum = () => {
    document.querySelector(".impressum").classList.toggle("hidden");
};

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    window.toggleTheme();
}

const _ = new Typed("#greeting-typing", {
    stringsElement: "#greeting",
    typeSpeed: 30,
    onStringTyped: () =>
        setTimeout(
            () => document.querySelector(".typed-cursor").remove(),
            2000
        ),
});

customElements.define("fyi-jakob-item", Item);
customElements.define("fyi-jakob-event", Event);
