import styles from "bundle-text:./event.scss";
import { WebComponent } from "../component";

export class EventComponent extends WebComponent {
    constructor() {
        super();
        this.expanded = false;
    }

    connectedCallback() {
        const containerEl = this.createBaseElement(
            "event",
            this.getAttribute("link"),
        );

        this.addStyle(styles);

        const leftEl = document.createElement("div");
        leftEl.setAttribute("class", "event__left");

        const titleEl = document.createElement("div");
        titleEl.setAttribute("class", "event__title");
        titleEl.innerText = this.getAttribute("title");

        const subtitleEl = document.createElement("div");
        subtitleEl.setAttribute("class", "event__subtitle");
        subtitleEl.innerText = this.getAttribute("subtitle");

        const datetimeEl = document.createElement("div");
        datetimeEl.setAttribute("class", "event__datetime");
        datetimeEl.innerText = `${this.getAttribute(
            "date",
        )} | ${this.getAttribute("time")}`;

        const placeEl = document.createElement("div");
        placeEl.setAttribute("class", "event__place");
        placeEl.innerText = this.getAttribute("place");

        const tagsEl = document.createElement("div");
        tagsEl.setAttribute("class", "event__tags");

        this.getAttribute("tags")
            .split(",")
            .forEach((tag) => {
                tagsEl.innerHTML += `<span class="event__tag">${tag.trim()}</span>`;
            });

        leftEl.append(tagsEl);
        leftEl.append(titleEl);
        leftEl.append(subtitleEl);
        leftEl.append(datetimeEl);
        leftEl.append(placeEl);

        const expandedEl = document.createElement("div");
        expandedEl.setAttribute("class", "event__expanded");
        expandedEl.setAttribute("expanded", this.expanded);
        expandedEl.innerHTML =
            '<div class="event__expanded-spacer"></div>' + this.innerHTML;

        containerEl.onclick = () => {
            this.expanded = !this.expanded;

            expandedEl.classList.add(
                this.expanded ? "show-expanded" : "hide-expanded",
            );
            expandedEl.classList.remove(
                this.expanded ? "hide-expanded" : "show-expanded",
            );
        };

        leftEl.append(expandedEl);
        containerEl.append(leftEl);
    }
}
