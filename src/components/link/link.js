import styles from "bundle-text:./link.scss";
import { WebComponent } from "../component";

export class LinkComponent extends WebComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        const containerEl = this.createBaseElement(
            "link",
            this.getAttribute("link"),
        );

        this.addStyle(styles);

        if (this.getAttribute("target")) {
            containerEl.setAttribute("target", this.getAttribute("target"));
        }

        const mainEl = document.createElement("div");
        mainEl.setAttribute("class", "link__main");

        const asideEl = document.createElement("div");
        asideEl.setAttribute("class", "link__aside");
        asideEl.innerHTML = `<svg fill="none" class="link-icon" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="#4A5568" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`;

        const titleEl = document.createElement("div");
        titleEl.setAttribute("class", "link__title");
        titleEl.innerText = this.getAttribute("title");

        const subtitleEl = document.createElement("div");
        subtitleEl.setAttribute("class", "link__subtitle");
        subtitleEl.innerText = this.getAttribute("subtitle");

        mainEl.append(titleEl);
        mainEl.append(subtitleEl);
        containerEl.append(mainEl);
        containerEl.append(asideEl);
    }
}
