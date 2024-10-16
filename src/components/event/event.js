import styles from "bundle-text:./event.css";
import { WebComponent } from "../component";

export class Event extends WebComponent {
    constructor() {
        super();
    }

    connectedCallback() {
        const containerEl = this.createBaseElement(
            "event",
            this.getAttribute("link")
        );

        this.addStyle(styles);

        const leftEl = document.createElement("div");
        leftEl.setAttribute("class", "event__left");

        const titleEl = document.createElement("div");
        titleEl.setAttribute("class", "event__title");
        titleEl.innerText = this.getAttribute("title");

        leftEl.append(titleEl);
        containerEl.append(leftEl);
    }
}
