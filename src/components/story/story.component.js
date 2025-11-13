import { css, html, LitElement } from "lit";

export class Story extends LitElement {
    static styles = css`
        p {
            color: blue;
        }
    `;

    static properties = {
        name: { type: String },
    };

    constructor() {
        super();
        this.name = "Somebody";
    }

    render() {
        return html`<p>Hello, ${this.name}!</p>`;
    }
}
customElements.define("fyi-jakob-story-v2", Story);
