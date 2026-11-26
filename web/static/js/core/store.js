const state = {
  ideas: [],
  selectedId: null,
  currentIdea: null,
  notes: [],
  milestones: [],
  status: "",
  search: "",
  showArchived: false,
  noteKind: "text",
  editingNoteId: null,
  editingMilestoneId: null,
  searchTimer: null
};

export function getState() {
  return state;
}

export function updateState(patch) {
  Object.assign(state, patch);
}
