import { css, html, LitElement } from "lit";
import { jsonArray, renderTags } from "../ui/tags";

/** Plain card without link or interaction (papers, texts). */
export class ProjectText extends LitElement {
    static styles = css`
        :host {
            display: block;
        }
    `;

    static properties = {
        mainTitle: { type: String },
        subTitle: { type: String },
        tags: { converter: jsonArray },
        time: { type: String }
    };

    render() {
        return html`<fyi-jakob-item>
            ${renderTags(this.tags, this.time)}
            <fyi-jakob-titles
                slot="content"
                .mainTitle=${this.mainTitle}
                .subTitle=${this.subTitle}
            ></fyi-jakob-titles>
        </fyi-jakob-item>`;
    }
}
