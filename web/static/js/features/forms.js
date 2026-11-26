import { $ } from "../core/dom.js";
import { STATUS_META } from "../core/constants.js";
import { updateState } from "../core/store.js";
import { openModal } from "../core/modal.js";

export function initIdeaStatusOptions() {
  $("#ideaStatusInput").innerHTML = Object.keys(STATUS_META)
    .map(value => `<option value="${value}">${value}</option>`)
    .join("");
}

export function openIdeaForm(idea = null) {
  $("#ideaForm").reset();
  $("#ideaIdInput").value = idea?.id || "";
  $("#ideaTitleInput").value = idea?.title || "";
  $("#ideaSummaryInput").value = idea?.summary || "";
  $("#ideaTagsInput").value = (idea?.tags || []).join(", ");
  $("#ideaStatusInput").value = idea?.status || "头脑风暴";
  $("#ideaModalTitle").textContent = idea ? "编辑灵感" : "新建灵感";
  openModal("ideaModal");
}

export function readIdeaForm() {
  return {
    title: $("#ideaTitleInput").value.trim(),
    summary: $("#ideaSummaryInput").value.trim(),
    status: $("#ideaStatusInput").value,
    tags: $("#ideaTagsInput").value
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(Boolean)
  };
}

export function openMilestoneForm(milestone = null) {
  $("#milestoneForm").reset();
  updateState({ editingMilestoneId: milestone?.id || null });
  $("#milestoneIdInput").value = milestone?.id || "";
  $("#milestoneNameInput").value = milestone?.name || "";
  $("#milestoneDateInput").value = milestone?.due_date || "";
  $("#milestoneCompletedInput").checked = Boolean(milestone?.completed);
  $("#milestoneModalTitle").textContent = milestone ? "编辑里程碑" : "添加里程碑";
  openModal("milestoneModal");
}

export function readMilestoneForm() {
  return {
    name: $("#milestoneNameInput").value.trim(),
    due_date: $("#milestoneDateInput").value || null,
    completed: $("#milestoneCompletedInput").checked
  };
}
