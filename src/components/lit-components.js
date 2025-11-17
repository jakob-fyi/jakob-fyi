import { ProjectEvent } from "./feature/project-event";
import { ProjectLink } from "./feature/project-link";
import { ProjectStory } from "./feature/project-story";
import { ProjectText } from "./feature/project-text";
import { Section } from "./feature/section";
import { Item } from "./ui/item";
import { MetaItem } from "./ui/meta-item";
import { MetaLine } from "./ui/meta-line";
import { Titles } from "./ui/titles";

// Dump/UI Components
customElements.define("fyi-jakob-item-lit", Item);
customElements.define("fyi-jakob-meta-item-lit", MetaItem);
customElements.define("fyi-jakob-meta-line-lit", MetaLine);
customElements.define("fyi-jakob-titles-lit", Titles);
customElements.define("fyi-jakob-section", Section);

// Feature Components
customElements.define("fyi-jakob-project-link-lit", ProjectLink);
customElements.define("fyi-jakob-project-text-lit", ProjectText);
customElements.define("fyi-jakob-project-event-lit", ProjectEvent);
customElements.define("fyi-jakob-project-story-lit", ProjectStory);
