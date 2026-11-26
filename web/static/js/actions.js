import { api } from "./core/api.js";
import { getState, updateState } from "./core/store.js";

export async function reloadIdeas() {
  const ideas = await api.ideas.list({ includeArchived: true });
  updateState({ ideas });
  return ideas;
}

export async function loadIdeaBundle(id) {
  const [idea, notes, milestones] = await Promise.all([
    api.ideas.get(id),
    api.notes.list(id),
    api.milestones.list(id)
  ]);
  updateState({
    selectedId: id,
    currentIdea: idea,
    notes,
    milestones,
    editingNoteId: null,
    noteKind: "text"
  });
  return { idea, notes, milestones };
}

export async function saveIdea(payload, ideaId = null) {
  return ideaId
    ? api.ideas.update(ideaId, payload)
    : api.ideas.create(payload);
}

export async function removeIdea(id) {
  await api.ideas.remove(id);
  updateState({ selectedId: null });
}

export async function archiveIdea(id) {
  await api.ideas.archive(id);
  updateState({ selectedId: null });
}

export async function restoreIdea(id) {
  await api.ideas.restore(id);
  return id;
}

export async function saveNote({ ideaId, noteId, payload }) {
  if (noteId) return api.notes.update(noteId, payload);
  return api.notes.create(ideaId, payload);
}

export async function removeNote(id) {
  await api.notes.remove(id);
}

export async function saveMilestone({ ideaId, milestoneId, payload }) {
  if (milestoneId) return api.milestones.update(milestoneId, payload);
  return api.milestones.create(ideaId, payload);
}

export async function toggleMilestone(id, completed) {
  return api.milestones.update(id, { completed });
}

export async function removeMilestone(id) {
  await api.milestones.remove(id);
}

export function currentIdeaId() {
  return getState().selectedId;
}
