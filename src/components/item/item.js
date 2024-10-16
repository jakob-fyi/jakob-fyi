import styles from "bundle-text:./item.css";
import { WebComponent } from "../component";

export class Item extends WebComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        const containerEl = this.createBaseElement(
            "item",
            this.getAttribute("link")
        );

        this.addStyle(styles);

        const leftEl = document.createElement("div");
        leftEl.setAttribute("class", "item__left");

        const rightEl = document.createElement("div");
        rightEl.setAttribute("class", "item__right");

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

        leftEl.appendChild(titleEl);
        leftEl.appendChild(subtitleEl);
        containerEl.appendChild(leftEl);
        rightEl.appendChild(tagsEl);
        containerEl.appendChild(rightEl);
    }
}
