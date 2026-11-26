import { bindModalEvents } from "./core/modal.js";
import { loadWorkspace } from "./core/workspace.js";
import {
  initIdeaStatusOptions
} from "./features/forms.js";
import { bindIdeasController } from "./controllers/ideas-controller.js";
import { bindNotesController } from "./controllers/notes-controller.js";
import { bindMilestonesController } from "./controllers/milestones-controller.js";


initIdeaStatusOptions();
bindModalEvents();
bindIdeasController();
bindNotesController();
bindMilestonesController();
loadWorkspace();
