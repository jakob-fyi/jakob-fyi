import styles from "bundle-text:./project.scss";
import { WebComponent } from "../component";

export class ProjectComponent extends WebComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        const containerEl = this.createBaseElement(
            "item",
            this.getAttribute("link"),
        );

        this.addStyle(styles);

        if (this.getAttribute("target")) {
            containerEl.setAttribute("target", this.getAttribute("target"));
        }

        const mainEl = document.createElement("div");
        mainEl.setAttribute("class", "item__main");

        const asideEl = document.createElement("div");
        asideEl.setAttribute("class", "item__aside");

        if (this.getAttribute("link")) {
            asideEl.innerHTML = `<svg fill="none" class="icon" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="#4A5568" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`;
        }

        if (this.getAttribute("story")) {
            containerEl.setAttribute(
                "onclick",
                `openStory('${this.getAttribute("story")}')`,
            );
            asideEl.innerHTML = `<svg class="icon" viewBox="0 0 512 512"><rect x="48" y="80" width="416" height="352" rx="48" ry="48" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/><circle cx="336" cy="176" r="32" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path d="M304 335.79l-90.66-90.49a32 32 0 00-43.87-1.3L48 352M224 432l123.34-123.34a32 32 0 0143.11-2L464 368" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>`;
        }

        const contentEl = document.createElement("div");
        contentEl.setAttribute("class", "item__content");

        const metaEl = document.createElement("div");
        metaEl.setAttribute("class", "item__meta");

        const titleEl = document.createElement("div");
        titleEl.setAttribute("class", "item__title");
        titleEl.innerText = this.getAttribute("title");

        const subtitleEl = document.createElement("div");
        subtitleEl.setAttribute("class", "item__subtitle");
        subtitleEl.innerText = this.getAttribute("subtitle");

        const tagsEl = document.createElement("div");
        tagsEl.setAttribute("class", "item__tags");

        this.getAttribute("tags")
            .split(",")
            .forEach((tag) => {
                tagsEl.innerHTML += `<span class="item__tag">${tag.trim()}</span>`;
            });

        const timeEl = document.createElement("div");
        timeEl.setAttribute("class", "item__time");
        timeEl.innerText = this.getAttribute("time");
        tagsEl.innerHTML += `<span class="item__tag">${this.getAttribute("time")}</span>`;

        contentEl.appendChild(titleEl);
        contentEl.appendChild(subtitleEl);
        metaEl.appendChild(tagsEl);
        metaEl.appendChild(timeEl);
        mainEl.appendChild(metaEl);
        mainEl.appendChild(contentEl);
        containerEl.appendChild(mainEl);
        containerEl.appendChild(asideEl);
    }
}
