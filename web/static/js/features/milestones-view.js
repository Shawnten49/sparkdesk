import { daysFromToday, escapeHtml, formatFullDate } from "../core/dom.js";
import { getState } from "../core/store.js";

export function milestoneDueMeta(milestone) {
  if (milestone.completed) {
    return '<span class="text-emerald-600">已完成</span>';
  }
  if (!milestone.due_date) {
    return '<span class="text-stone-400">未设日期</span>';
  }
  const days = daysFromToday(milestone.due_date);
  if (days < 0) {
    return `<span class="font-medium text-red-500">逾期 ${Math.abs(days)} 天</span>`;
  }
  if (days === 0) {
    return '<span class="font-medium text-amber-600">今天到期</span>';
  }
  return `<span class="${days <= 3 ? "text-amber-600" : "text-stone-400"}">${formatFullDate(milestone.due_date)} · 还有 ${days} 天</span>`;
}

export function renderMilestones() {
  const state = getState();
  const list = document.querySelector("#milestoneList");
  if (!list) return;
  if (!state.milestones.length) {
    list.innerHTML = `
      <div class="rounded-2xl border border-dashed border-stone-200 px-5 py-10 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-400">◇</div>
        <p class="text-sm font-medium text-stone-500">还没有阶段目标</p>
        <p class="mt-1 text-xs leading-5 text-stone-400">先定义一件最近能做的小事。</p>
      </div>`;
    return;
  }
  list.innerHTML = state.milestones.map((milestone, index) => `
    <div class="group rounded-2xl border ${milestone.completed ? "border-emerald-100 bg-emerald-50/35" : "border-black/[0.07] bg-white/65"} p-3.5 transition hover:bg-white">
      <div class="flex items-start gap-3">
        <label class="relative mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center">
          <input type="checkbox" data-action="toggle-milestone" data-milestone-id="${milestone.id}" ${milestone.completed ? "checked" : ""} class="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-md border border-stone-300 bg-white transition checked:border-moss checked:bg-moss focus:outline-none focus:ring-2 focus:ring-moss/20" />
          <svg class="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 4 4L19 6"/></svg>
        </label>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <p class="break-words text-sm font-medium leading-5 ${milestone.completed ? "text-stone-400 line-through decoration-stone-300" : "text-stone-700"}">${escapeHtml(milestone.name)}</p>
            <div class="flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button data-action="edit-milestone" data-milestone-id="${milestone.id}" class="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-ink" aria-label="编辑里程碑">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg>
              </button>
              <button data-action="delete-milestone" data-milestone-id="${milestone.id}" class="rounded-md p-1 text-stone-400 hover:bg-red-50 hover:text-red-500" aria-label="删除里程碑">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/></svg>
              </button>
            </div>
          </div>
          <div class="mt-1.5 flex items-center gap-2 text-[10px]">
            <span class="tabular-nums text-stone-300">#${String(index + 1).padStart(2, "0")}</span>
            <span class="h-0.5 w-0.5 rounded-full bg-stone-300"></span>
            ${milestoneDueMeta(milestone)}
          </div>
        </div>
      </div>
    </div>
  `).join("");
}
