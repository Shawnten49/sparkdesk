import { $, escapeHtml, formatTime } from "../core/dom.js";
import { STATUS_META } from "../core/constants.js";
import { getState } from "../core/store.js";

export function statusBadge(status) {
  const meta = STATUS_META[status] || STATUS_META["头脑风暴"];
  return `<span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.className}">
    <span class="h-1.5 w-1.5 rounded-full ${meta.dot}"></span>${escapeHtml(status)}
  </span>`;
}

export function progressColor(progress) {
  if (progress >= 100) return "bg-emerald-600";
  if (progress >= 50) return "bg-moss";
  return "bg-coral";
}

export function visibleIdeas() {
  const state = getState();
  const keyword = state.search.trim().toLowerCase();
  return state.ideas.filter(idea => {
    if (!state.showArchived && idea.archived) return false;
    if (state.status && idea.status !== state.status) return false;
    if (!keyword) return true;
    return [idea.title, idea.summary, ...(idea.tags || [])]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
}

export function renderStats() {
  const state = getState();
  const active = state.ideas.filter(idea => !idea.archived);
  const counts = active.reduce((acc, idea) => {
    acc[idea.status] = (acc[idea.status] || 0) + 1;
    return acc;
  }, {});
  const cards = [
    { label: "活跃灵感", value: active.length, note: "仍在孵化", accent: "bg-ink" },
    { label: "头脑风暴", value: counts["头脑风暴"] || 0, note: "等待探索", accent: "bg-amber-500" },
    { label: "进行中", value: counts["进行中"] || 0, note: "正在推进", accent: "bg-moss" },
    { label: "已搁置", value: counts["已搁置"] || 0, note: "暂时放下", accent: "bg-stone-400" }
  ];
  $("#statsRow").innerHTML = cards.map(card => `
    <div class="glass relative overflow-hidden rounded-2xl border border-white/70 px-4 py-4 shadow-soft sm:px-5">
      <span class="absolute right-0 top-0 h-12 w-12 translate-x-5 -translate-y-5 rounded-full ${card.accent} opacity-10"></span>
      <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">${card.label}</p>
      <div class="mt-1.5 flex items-end justify-between gap-2">
        <strong class="text-2xl font-semibold tracking-tight tabular-nums">${card.value}</strong>
        <span class="pb-0.5 text-[10px] text-stone-400">${card.note}</span>
      </div>
    </div>
  `).join("");
}

export function renderStatusFilters() {
  const state = getState();
  const items = [
    { value: "", label: "全部" },
    ...Object.keys(STATUS_META).map(value => ({ value, label: value }))
  ];
  $("#statusFilters").innerHTML = items.map(item => {
    const count = item.value
      ? state.ideas.filter(idea => !idea.archived && idea.status === item.value).length
      : state.ideas.filter(idea => !idea.archived).length;
    const selected = state.status === item.value;
    return `<button type="button" data-status-filter="${escapeHtml(item.value)}" class="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${selected ? "bg-ink text-white shadow-sm" : "bg-white/55 text-stone-500 hover:bg-white hover:text-ink"}">
      ${escapeHtml(item.label)} <span class="ml-0.5 opacity-60">${count}</span>
    </button>`;
  }).join("");
}

export function renderIdeaList() {
  const state = getState();
  const ideas = visibleIdeas();
  $("#visibleCount").textContent = `${ideas.length} 条`;
  if (!ideas.length) {
    $("#ideaList").innerHTML = `
      <div class="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-xl text-stone-400">∅</div>
        <p class="text-sm font-semibold text-stone-600">没有找到灵感</p>
        <p class="mt-1 text-xs leading-5 text-stone-400">尝试调整筛选条件，或创建一个新念头。</p>
      </div>`;
    return;
  }
  $("#ideaList").innerHTML = ideas.map(idea => `
    <button type="button" data-idea-id="${idea.id}" class="idea-card block w-full rounded-2xl border border-black/[0.07] bg-white/60 p-4 text-left ${state.selectedId === idea.id ? "selected" : ""}">
      <div class="flex items-start justify-between gap-3">
        ${statusBadge(idea.status)}
        <div class="flex shrink-0 flex-col items-end gap-1.5">
          ${idea.status === "头脑风暴" ? `<span class="flex items-center gap-1 text-[10px] tabular-nums text-stone-400" title="创建于 ${formatTime(idea.created_at)}">
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            创建于 ${formatTime(idea.created_at)}
          </span>` : ""}
          ${idea.archived ? '<span class="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-400">已归档</span>' : ""}
        </div>
      </div>
      <h3 class="mt-3 line-clamp-1 text-[15px] font-semibold tracking-tight text-ink">${escapeHtml(idea.title)}</h3>
      <p class="mt-1.5 line-clamp-2 min-h-[2.6rem] text-xs leading-5 text-stone-500">${escapeHtml(idea.summary || "还没有补充简介。")}</p>
      ${idea.tags?.length ? `<div class="mt-3 flex flex-wrap gap-1.5">${idea.tags.slice(0, 3).map(tag => `<span class="rounded-md bg-stone-100/80 px-1.5 py-0.5 text-[10px] text-stone-500">#${escapeHtml(tag)}</span>`).join("")}${idea.tags.length > 3 ? `<span class="px-1 text-[10px] text-stone-400">+${idea.tags.length - 3}</span>` : ""}</div>` : ""}
      <div class="mt-3.5 flex items-center gap-2 border-t border-black/[0.05] pt-3">
        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200/70">
          <div class="h-full rounded-full ${progressColor(idea.progress)}" style="width:${idea.progress}%"></div>
        </div>
        <span class="w-8 text-right text-[10px] font-semibold tabular-nums text-stone-400">${idea.progress}%</span>
        <span class="ml-1 flex items-center gap-1 text-[10px] text-stone-400">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16v11H8l-4 4V5Z"/></svg>
          ${idea.note_count}
        </span>
      </div>
    </button>
  `).join("");
}
