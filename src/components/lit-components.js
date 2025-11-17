import { Job } from "./feature/job";
import { Link } from "./feature/link";
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
customElements.define("fyi-jakob-item", Item);
customElements.define("fyi-jakob-meta-item", MetaItem);
customElements.define("fyi-jakob-meta-line", MetaLine);
customElements.define("fyi-jakob-titles", Titles);
customElements.define("fyi-jakob-section", Section);
customElements.define("fyi-jakob-job", Job);
customElements.define("fyi-jakob-link", Link);

// Feature Components
customElements.define("fyi-jakob-project-link", ProjectLink);
customElements.define("fyi-jakob-project-text", ProjectText);
customElements.define("fyi-jakob-project-event", ProjectEvent);
customElements.define("fyi-jakob-project-story", ProjectStory);
