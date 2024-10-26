export class WebComponent extends HTMLElement {
    constructor() {
        super();

        this.styleTag = document.createElement("style");
        this.styleTag.textContent = "";

        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.appendChild(this.styleTag);
    }

    createBaseElement(className, link = null) {
        const el = document.createElement(link ? "a" : "div");
        el.setAttribute("class", className);

        if (link) {
            el.setAttribute("href", link);
            el.setAttribute("rel", "noopener noreferrer");
        }

        this.shadow.appendChild(el);

        return el;
    }

    addStyle(style) {
        this.styleTag.textContent += `${style}
        `;
    }
}
