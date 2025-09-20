import styles from "bundle-text:./story.scss";
import { WebComponent } from "../component";

NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

export class StoryComponent extends WebComponent {
    constructor() {
        super();
    }

    containerWidth;
    imagesEl;
    imageWidth;
    slideEl;

    click(target) {
        const images = this.slideEl.getElementsByTagName("img");
        for (let i of images) {
            i.removeAttribute("class");
        }

        // console.log(target.sctollPosition);

        target.setAttribute("class", "active");
        const sc = target.getAttribute("number") * (this.imageWidth + 20);
        this.imagesEl.scrollTo(sc, 0);
    }

    connectedCallback() {
        const containerEl = this.createBaseElement("story");

        this.addStyle(styles);
        this.containerWidth = containerEl.clientWidth;

        const titleEl = document.createElement("div");
        titleEl.setAttribute("class", "story__title");
        titleEl.innerText = this.getAttribute("title");

        this.imagesEl = document.createElement("div");
        this.imagesEl.setAttribute("class", "story__images");

        this.slideEl = document.createElement("div");
        this.slideEl.setAttribute("class", "slide");
        this.slideEl.innerHTML = this.innerHTML;

        //     "<div class='seperator'></div>" +
        //     this.innerHTML +
        //     "<div class='seperator'></div>";
        // const seperators = this.slideEl.getElementsByTagName("div");

        containerEl.appendChild(titleEl);
        this.imagesEl.appendChild(this.slideEl);
        containerEl.appendChild(this.imagesEl);
        const images = this.slideEl.getElementsByTagName("img");
        for (let image of images) {
            image.addEventListener("click", (event) =>
                this.click(event.target),
            );
            // image.width = this.imageWidth;
        }
        // img.addEventListener("resize", () => console.log("asd"));
        this.imageWidth = images[0].clientWidth;
        this.slideEl.style.marginLeft = `${(this.containerWidth - this.imageWidth) / 2}px`;

        // this.slideEl.childNodes.forEach((element) => {
        //     element.addEventListener("click", (x) => this.click(x.target));
        //     this.containerWidth
        // });

        // console.log(this.imagesEl.clientWidth, img, img.width, img.width);
        // const pad = this.imagesEl.clientWidth / 2 - this.imgWidth / 2;
        // seperators[0].style.width = `${pad}px`;
        // seperators[1].style.width = `${pad}px`;

        this.click(images[0]);

        // imagesEl.scrollTo(imgWidth / 2, 0);

        // slideEl.style.marginRight = `${pad}px`;

        // const imagesRatio = imagesEl.clientWidth / imagesEl.clientHeight;
        // let width = imagesEl.clientHeight * 0.5625;
        // let height = imagesEl.clientHeight;
        // if (imagesRatio < 0.5625) {
        //     width = imagesEl.clientWidth;
        //     height = width / 0.5625;
        // }

        // console.log(width);
        // console.log(height);
        // innerHTML.style.paddingLeft = `${pad}px`;
        // imagesEl.style.paddingRight = `${pad}px`;

        // values are x,y-offset

        // document.getElementById("lightgallery")

        // if (this.getAttribute("target")) {
        //     containerEl.setAttribute("target", this.getAttribute("target"));
        // }

        // const mainEl = document.createElement("div");
        // mainEl.setAttribute("class", "item__main");

        // const asideEl = document.createElement("div");
        // asideEl.setAttribute("class", "item__aside");

        // if (this.getAttribute("link")) {
        //     asideEl.innerHTML = `<svg fill="none" class="link-icon" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="#4A5568" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`;
        // }

        // const contentEl = document.createElement("div");
        // contentEl.setAttribute("class", "item__content");

        // const metaEl = document.createElement("div");
        // metaEl.setAttribute("class", "item__meta");

        // const titleEl = document.createElement("div");
        // titleEl.setAttribute("class", "item__title");
        // titleEl.innerText = this.getAttribute("title");

        // const subtitleEl = document.createElement("div");
        // subtitleEl.setAttribute("class", "item__subtitle");
        // subtitleEl.innerText = this.getAttribute("subtitle");

        // const tagsEl = document.createElement("div");
        // tagsEl.setAttribute("class", "item__tags");

        // this.getAttribute("tags")
        //     .split(",")
        //     .forEach((tag) => {
        //         tagsEl.innerHTML += `<span class="item__tag">${tag.trim()}</span>`;
        //     });

        // const timeEl = document.createElement("div");
        // timeEl.setAttribute("class", "item__time");
        // timeEl.innerText = this.getAttribute("time");
        // tagsEl.innerHTML += `<span class="item__tag">${this.getAttribute("time")}</span>`;

        // contentEl.appendChild(titleEl);
        // contentEl.appendChild(subtitleEl);
        // metaEl.appendChild(tagsEl);
        // metaEl.appendChild(timeEl);
        // mainEl.appendChild(metaEl);
        // mainEl.appendChild(contentEl);
        // containerEl.appendChild(mainEl);
        // containerEl.appendChild(asideEl);
    }
}
