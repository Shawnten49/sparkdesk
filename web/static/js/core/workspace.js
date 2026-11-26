import { getState, updateState } from "./store.js";
import { showToast } from "./toast.js";
import { loadIdeaBundle, reloadIdeas } from "../actions.js";
import {
  renderIdeaList,
  renderStats,
  renderStatusFilters,
  visibleIdeas
} from "../features/ideas-view.js";
import { renderDetail } from "../features/detail-view.js";

export function renderWorkspace() {
  renderStats();
  renderStatusFilters();
  renderIdeaList();
}

export function clearDetail() {
  updateState({
    selectedId: null,
    currentIdea: null,
    notes: [],
    milestones: [],
    editingNoteId: null
  });
  renderDetail();
  renderIdeaList();
}

export async function openIdea(id, options = {}) {
  updateState({ selectedId: id, editingNoteId: null });
  renderIdeaList();
  try {
    await loadIdeaBundle(id);
    renderDetail();
    if (options.scroll && window.innerWidth < 1024) {
      setTimeout(() => {
        document.querySelector("#detailPanel")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  } catch (error) {
    showToast(error.message, "error");
    clearDetail();
  }
}

export async function loadWorkspace(options = {}) {
  const state = getState();
  const desiredId = options.selectId ?? state.selectedId;
  try {
    await reloadIdeas();
    renderWorkspace();
    const available = getState().ideas.some(idea => idea.id === desiredId);
    if (available) {
      await openIdea(desiredId);
      return;
    }
    const first = visibleIdeas()[0];
    if (first) {
      await openIdea(first.id);
    } else {
      clearDetail();
    }
  } catch (error) {
    showToast(`无法加载灵感：${error.message}`, "error");
    document.querySelector("#ideaList").innerHTML = `
      <div class="p-5 text-center text-sm text-red-500">
        服务连接失败，请确认 main.py 正在运行。
      </div>`;
  }
}

export function syncVisibleSelection() {
  const ideas = visibleIdeas();
  const selectedId = getState().selectedId;
  if (!selectedId || !ideas.some(idea => idea.id === selectedId)) {
    if (ideas.length) {
      openIdea(ideas[0].id);
    } else {
      clearDetail();
    }
  }
}
