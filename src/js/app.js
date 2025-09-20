import PhotoSwipe from "photoswipe";
import Typed from "typed.js";
import { EventComponent } from "../components/event/event";
import { JobComponent } from "../components/job/job";
import { LinkComponent } from "../components/link/link";
import { ProjectComponent } from "../components/project/project";
import { StoryComponent } from "../components/story/story";

window.toggleTheme = () => {
    document.body.classList.toggle("dark");
};

window.toggleGrid = () => {
    document.body.classList.toggle("grid");
};

window.toggleImpressum = () => {
    document.querySelector(".impressum").classList.toggle("hidden");
};

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    window.toggleTheme();
}

customElements.define("fyi-jakob-project", ProjectComponent);
customElements.define("fyi-jakob-event", EventComponent);
customElements.define("fyi-jakob-link", LinkComponent);
customElements.define("fyi-jakob-job", JobComponent);
customElements.define("fyi-jakob-story", StoryComponent);

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

    const lightbox = new PhotoSwipe({
        // may select multiple "galleries"
        gallery: "#gallery--getting-started",

        // Elements within gallery (slides)
        children: "a",

        // setup PhotoSwipe Core dynamic import
        pswpModule: () => import("photoswipe"),
    });

    lightbox.init();
};
