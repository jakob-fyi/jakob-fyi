import styles from "bundle-text:./job.scss";
import { WebComponent } from "../component";

export class JobComponent extends WebComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        const containerEl = this.createBaseElement(
            "job",
            this.getAttribute("link"),
        );

        this.addStyle(styles);

        if (this.getAttribute("target")) {
            containerEl.setAttribute("target", this.getAttribute("target"));
        }

        const mainEl = document.createElement("div");
        mainEl.setAttribute("class", "job__main");

        const asideEl = document.createElement("div");
        asideEl.setAttribute("class", "job__aside");

        const tagsEl = document.createElement("div");
        tagsEl.setAttribute("class", "job__tags");
        tagsEl.innerHTML += `<span class="job__tag">${this.getAttribute("time")}</span>`;

        const titleEl = document.createElement("div");
        titleEl.setAttribute("class", "job__title");
        titleEl.innerText = this.getAttribute("title");

        const subtitleEl = document.createElement("div");
        subtitleEl.setAttribute("class", "job__subtitle");
        subtitleEl.innerText = this.getAttribute("subtitle");

        mainEl.append(tagsEl);
        mainEl.append(titleEl);
        mainEl.append(subtitleEl);
        containerEl.append(mainEl);
        containerEl.append(asideEl);
    }
}
