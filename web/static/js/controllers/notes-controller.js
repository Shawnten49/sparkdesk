import { $ } from "../core/dom.js";
import { getState, updateState } from "../core/store.js";
import { confirmAction } from "../core/modal.js";
import { showToast } from "../core/toast.js";
import {
  removeNote,
  saveNote
} from "../actions.js";
import { loadWorkspace } from "../core/workspace.js";
import { renderDetail } from "../features/detail-view.js";

export function bindNotesController() {
  $("#detailView").addEventListener("click", async event => {
    const kindButton = event.target.closest("[data-note-kind]");
    if (kindButton) {
      const currentText = $("#noteContentInput")?.value || "";
      updateState({ noteKind: kindButton.dataset.noteKind });
      renderDetail();
      if (currentText) $("#noteContentInput").value = currentText;
      return;
    }

    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const state = getState();

    if (action === "edit-note") {
      const note = state.notes.find(
        item => item.id === Number(button.dataset.noteId)
      );
      if (!note) return;
      updateState({ editingNoteId: note.id, noteKind: note.kind });
      renderDetail();
      $("#noteContentInput").value = note.content;
      $("#noteContentInput").focus();
      $("#noteContentInput").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      return;
    }

    if (action === "cancel-note-edit") {
      updateState({ editingNoteId: null, noteKind: "text" });
      renderDetail();
      return;
    }

    if (action === "delete-note") {
      const note = state.notes.find(
        item => item.id === Number(button.dataset.noteId)
      );
      if (!note) return;
      const confirmed = await confirmAction({
        title: "删除这条记录？",
        message: "删除后这条笔记内容将无法恢复。"
      });
      if (!confirmed) return;
      try {
        await removeNote(note.id);
        showToast("记录已删除");
        await loadWorkspace({ selectId: state.selectedId });
      } catch (error) {
        showToast(error.message, "error");
      }
    }
  });

  $("#detailView").addEventListener("submit", async event => {
    if (event.target.id !== "noteForm") return;
    event.preventDefault();
    const state = getState();
    const content = $("#noteContentInput").value.trim();
    if (!content) {
      showToast("先写点内容再保存", "error");
      $("#noteContentInput").focus();
      return;
    }
    const wasEditing = Boolean(state.editingNoteId);
    try {
      await saveNote({
        ideaId: state.selectedId,
        noteId: state.editingNoteId,
        payload: { kind: state.noteKind, content }
      });
      updateState({ editingNoteId: null, noteKind: "text" });
      showToast(wasEditing ? "记录已更新" : "记录已添加");
      await loadWorkspace({ selectId: state.selectedId });
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  $("#detailView").addEventListener("keydown", event => {
    if (
      event.target.id === "noteContentInput"
      && event.key === "Enter"
      && (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      $("#noteForm").requestSubmit();
    }
  });
}
