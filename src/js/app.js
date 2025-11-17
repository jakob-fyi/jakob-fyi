import Typed from "typed.js";

window.toggleTheme = () => {
    document.body.classList.toggle("dark");
};

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    window.toggleTheme();
}

// customElements.define("fyi-jakob-link", LinkComponent);
// customElements.define("fyi-jakob-job", JobComponent);

window.initApp = () => {
    document.body.classList.add("init");

    setTimeout(() => {
        new Typed("#greeting-typing", {
            stringsElement: "#greeting",
            typeSpeed: 30,
            onStringTyped: () =>
                setTimeout(
                    () => document.querySelector(".typed-cursor").remove(),
                    2200,
                ),
        });
    }, 300);
};
