import { $ } from "../core/dom.js";
import { getState, updateState } from "../core/store.js";
import { confirmAction } from "../core/modal.js";
import { showToast } from "../core/toast.js";
import {
  removeMilestone,
  saveMilestone,
  toggleMilestone
} from "../actions.js";
import { loadWorkspace } from "../core/workspace.js";
import {
  openMilestoneForm,
  readMilestoneForm
} from "../features/forms.js";

export function bindMilestonesController() {
  $("#detailView").addEventListener("click", async event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const state = getState();

    if (action === "new-milestone") {
      openMilestoneForm();
      return;
    }
    if (action === "edit-milestone") {
      const milestone = state.milestones.find(
        item => item.id === Number(button.dataset.milestoneId)
      );
      if (milestone) openMilestoneForm(milestone);
      return;
    }
    if (action === "delete-milestone") {
      const milestone = state.milestones.find(
        item => item.id === Number(button.dataset.milestoneId)
      );
      if (!milestone) return;
      const confirmed = await confirmAction({
        title: "删除这个里程碑？",
        message: `“${milestone.name}”将从该灵感中移除。`
      });
      if (!confirmed) return;
      try {
        await removeMilestone(milestone.id);
        showToast("里程碑已删除");
        await loadWorkspace({ selectId: state.selectedId });
      } catch (error) {
        showToast(error.message, "error");
      }
    }
  });

  $("#detailView").addEventListener("change", async event => {
    const toggle = event.target.closest('[data-action="toggle-milestone"]');
    if (!toggle) return;
    const state = getState();
    try {
      await toggleMilestone(toggle.dataset.milestoneId, toggle.checked);
      showToast(toggle.checked ? "里程碑完成，进度已更新" : "里程碑已重新打开");
      await loadWorkspace({ selectId: state.selectedId });
    } catch (error) {
      toggle.checked = !toggle.checked;
      showToast(error.message, "error");
    }
  });

  $("#milestoneForm").addEventListener("submit", async event => {
    event.preventDefault();
    const state = getState();
    if (!state.selectedId) return;
    const payload = readMilestoneForm();
    if (!payload.name) {
      showToast("请填写阶段目标", "error");
      return;
    }
    try {
      await saveMilestone({
        ideaId: state.selectedId,
        milestoneId: state.editingMilestoneId,
        payload
      });
      $("#milestoneModal").classList.add("hidden");
      $("#milestoneModal").classList.remove("flex");
      document.body.style.overflow = "";
      showToast(state.editingMilestoneId ? "里程碑已更新" : "里程碑已添加");
      updateState({ editingMilestoneId: null });
      await loadWorkspace({ selectId: state.selectedId });
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}
