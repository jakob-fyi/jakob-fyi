import Typed from "typed.js";

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

export const setTheme = (dark) => {
    document.body.classList.toggle("dark", dark);
};

window.toggleTheme = () => {
    setTheme(!document.body.classList.contains("dark"));
};

// Follow the system setting initially and when it changes. Nothing is stored.
setTheme(darkQuery.matches);
darkQuery.addEventListener("change", (event) => setTheme(event.matches));

window.initApp = () => {
    document.body.classList.add("init");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    setTimeout(() => {
        new Typed("#greeting-typing", {
            stringsElement: "#greeting",
            typeSpeed: 30,
            onStringTyped: () =>
                setTimeout(
                    () => document.querySelector(".typed-cursor")?.remove(),
                    2200
                )
        });
    }, 300);
};
