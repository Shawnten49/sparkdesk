import { $ } from "../core/dom.js";
import { getState, updateState } from "../core/store.js";
import { confirmAction } from "../core/modal.js";
import { showToast } from "../core/toast.js";
import {
  archiveIdea,
  removeIdea,
  restoreIdea,
  saveIdea
} from "../actions.js";
import {
  loadWorkspace,
  openIdea,
  syncVisibleSelection
} from "../core/workspace.js";
import {
  openIdeaForm,
  readIdeaForm
} from "../features/forms.js";
import { renderIdeaList, renderStatusFilters } from "../features/ideas-view.js";

export function bindIdeasController() {
  $("#newIdeaBtn").addEventListener("click", () => openIdeaForm());
  $("#emptyCreateBtn").addEventListener("click", () => openIdeaForm());

  $("#searchInput").addEventListener("input", event => {
    const state = getState();
    clearTimeout(state.searchTimer);
    updateState({
      searchTimer: setTimeout(() => {
        updateState({ search: event.target.value });
        renderIdeaList();
        syncVisibleSelection();
      }, 120)
    });
  });

  $("#showArchivedInput").addEventListener("change", event => {
    updateState({ showArchived: event.target.checked });
    renderIdeaList();
    syncVisibleSelection();
  });

  $("#statusFilters").addEventListener("click", event => {
    const button = event.target.closest("[data-status-filter]");
    if (!button) return;
    updateState({ status: button.dataset.statusFilter });
    renderStatusFilters();
    renderIdeaList();
    syncVisibleSelection();
  });

  $("#ideaList").addEventListener("click", event => {
    const card = event.target.closest("[data-idea-id]");
    if (!card) return;
    openIdea(Number(card.dataset.ideaId), { scroll: true });
  });

  $("#ideaForm").addEventListener("submit", async event => {
    event.preventDefault();
    const ideaId = $("#ideaIdInput").value;
    const payload = readIdeaForm();
    if (!payload.title) {
      showToast("请填写灵感标题", "error");
      return;
    }
    try {
      const saved = await saveIdea(payload, ideaId);
      $("#ideaModal").classList.add("hidden");
      $("#ideaModal").classList.remove("flex");
      document.body.style.overflow = "";
      showToast(ideaId ? "灵感已更新" : "新灵感已加入工作台");
      await loadWorkspace({ selectId: saved.id });
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  $("#detailView").addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const idea = getState().currentIdea;
    if (!idea) return;

    if (action === "edit-idea") {
      openIdeaForm(idea);
      return;
    }
    if (action === "delete-idea") {
      const confirmed = await confirmAction({
        title: "删除这个灵感？",
        message: `“${idea.title}”及其全部笔记和里程碑都会被永久删除，且无法恢复。`
      });
      if (!confirmed) return;
      try {
        await removeIdea(idea.id);
        showToast("灵感已永久删除");
        await loadWorkspace();
      } catch (error) {
        showToast(error.message, "error");
      }
      return;
    }
    if (action === "archive") {
      const confirmed = await confirmAction({
        title: "归档这个灵感？",
        message: "灵感会从默认列表中隐藏，但所有记录仍会保留，可随时在“显示归档”中恢复。",
        confirmText: "确认归档",
        danger: false
      });
      if (!confirmed) return;
      try {
        await archiveIdea(idea.id);
        showToast("灵感已归档，可在“显示归档”中找到");
        await loadWorkspace();
      } catch (error) {
        showToast(error.message, "error");
      }
      return;
    }
    if (action === "restore") {
      try {
        await restoreIdea(idea.id);
        showToast("灵感已恢复");
        await loadWorkspace({ selectId: idea.id });
      } catch (error) {
        showToast(error.message, "error");
      }
    }
  });
}
