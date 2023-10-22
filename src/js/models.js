class Project {
    started = null;
    ended = null;
    category = null;
    done = false;
    content = null;

    constructor(obj) {
        this.started = obj.started;
        this.ended = obj.ended;
        this.category = obj.category;
        this.done = obj.done;
        this.content = new Content(obj.content);
    }

    isLinked = () => !!this.content.link;

    getElement = () => {

        let date = "";
        if (this.started && this.ended) {
            if (this.started == this.ended) {
                date = this.started;
            }
            else {
                date = this.started + " bis " + this.ended;
            }
        }
        else if (this.finished) {
            date = this.started;
        }
        else {
            date = `seit ${this.started}`;
        }

        return htmlToElement(`<${this.isLinked() ? 'a href="' + this.content.link + '" target="_blank"' : 'div'} class="item item--list">
            <div class="item__left">
                <h3 class="item__title">${this.content.title}</h3>
                <p class="item__subtitle">${this.content.susbtitle}</p>
            </div>
            <div class="item__right">
                <p class="item__date">${date}</p>
            </div>
        ${this.isLinked() ? '</a>' : '</div>'}`);
    }
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

class Content {
    title = null;
    susbtitle = null;
    link = null;

    constructor(obj) {
        this.title = obj.title;
        this.susbtitle = obj.susbtitle;
        this.link = obj.link;
    }
}

export { Project, Content };