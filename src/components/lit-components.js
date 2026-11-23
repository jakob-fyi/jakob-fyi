import { Collapsible } from "./feature/collapsible";
import { Job } from "./feature/job";
import { Link } from "./feature/link";
import { ProjectEvent } from "./feature/project-event";
import { ProjectLink } from "./feature/project-link";
import { ProjectStory } from "./feature/project-story";
import { ProjectText } from "./feature/project-text";
import { Section } from "./feature/section";
import { Item } from "./ui/item";
import { MetaItem } from "./ui/meta-item";
import { Titles } from "./ui/titles";

export const components = {
    // UI building blocks
    "fyi-jakob-item": Item,
    "fyi-jakob-meta-item": MetaItem,
    "fyi-jakob-titles": Titles,

    // Layout & feature components
    "fyi-jakob-section": Section,
    "fyi-jakob-collapsible": Collapsible,
    "fyi-jakob-job": Job,
    "fyi-jakob-link": Link,
    "fyi-jakob-project-link": ProjectLink,
    "fyi-jakob-project-text": ProjectText,
    "fyi-jakob-project-event": ProjectEvent,
    "fyi-jakob-project-story": ProjectStory
};

/** Idempotent, so tests and hot reloading can call it repeatedly. */
export const defineComponents = () => {
    for (const [name, element] of Object.entries(components)) {
        if (!customElements.get(name)) {
            customElements.define(name, element);
        }
    }
};

defineComponents();
