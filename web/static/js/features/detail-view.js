import { $, escapeHtml, formatTime } from "../core/dom.js";
import { getState } from "../core/store.js";
import { progressColor, statusBadge } from "./ideas-view.js";
import { renderNoteComposer, renderNotes } from "./notes-view.js";
import { renderMilestones } from "./milestones-view.js";

export function renderDetail() {
  const state = getState();
  const idea = state.currentIdea;
  if (!idea) {
    $("#detailView").classList.add("hidden");
    $("#emptyState").classList.remove("hidden");
    return;
  }

  $("#emptyState").classList.add("hidden");
  $("#detailView").classList.remove("hidden");
  const archiveAction = idea.archived
    ? '<button data-action="restore" class="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-50">恢复归档</button>'
    : (idea.status === "已废弃"
      ? '<button data-action="archive" class="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-50">归档隐藏</button>'
      : "");

  $("#detailView").innerHTML = `
    <div class="fade-in overflow-hidden rounded-[1.6rem] border border-white/80 bg-cream/90 shadow-soft">
      <div class="border-b border-black/[0.06] p-5 sm:p-7">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              ${statusBadge(idea.status)}
              ${idea.archived ? '<span class="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-400">已归档</span>' : ""}
              <span class="text-[11px] text-stone-400">更新于 ${formatTime(idea.updated_at)}</span>
            </div>
            <h2 class="mt-3 break-words text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">${escapeHtml(idea.title)}</h2>
            <p class="mt-2 max-w-3xl whitespace-pre-line text-sm leading-6 text-stone-500">${escapeHtml(idea.summary || "还没有一句话简介。")}</p>
            ${idea.tags?.length ? `<div class="mt-3 flex flex-wrap gap-1.5">${idea.tags.map(tag => `<span class="rounded-lg border border-black/[0.05] bg-white/70 px-2 py-1 text-[11px] text-stone-500">#${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
          </div>
          <div class="flex shrink-0 flex-wrap gap-2">
            ${archiveAction}
            <button data-action="edit-idea" class="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-50">编辑</button>
            <button data-action="delete-idea" class="rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50">删除</button>
          </div>
        </div>
        <div class="mt-6 rounded-2xl border border-black/[0.06] bg-white/60 p-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold text-stone-600">项目完成度</p>
              <p class="mt-1 text-[11px] text-stone-400">${idea.completed_milestones} / ${idea.milestone_count} 个里程碑已完成</p>
            </div>
            <strong class="text-2xl font-semibold tabular-nums tracking-tight">${idea.progress}<span class="ml-0.5 text-sm font-normal text-stone-400">%</span></strong>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-stone-200/80">
            <div class="h-full rounded-full ${progressColor(idea.progress)} ${idea.progress > 0 ? "progress-glow" : ""}" style="width:${idea.progress}%;transition:width .35s ease"></div>
          </div>
        </div>
      </div>
      <div class="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,.8fr)]">
        <section class="order-2 min-w-0 border-t border-black/[0.06] p-5 sm:p-7 xl:order-1 xl:border-r xl:border-t-0">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold tracking-tight">碎片与资料</h3>
              <p class="mt-1 text-[11px] text-stone-400">支持 Markdown · 最新记录在最上方</p>
            </div>
            <span class="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-stone-500">${state.notes.length} 条</span>
          </div>
          ${renderNoteComposer()}
          <div id="noteList" class="mt-5 space-y-3"></div>
        </section>
        <section class="order-1 min-w-0 p-5 sm:p-7 xl:order-2">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold tracking-tight">目标里程碑</h3>
              <p class="mt-1 text-[11px] text-stone-400">把想法拆成可勾选的小步</p>
            </div>
            <button data-action="new-milestone" class="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white transition hover:bg-black" aria-label="添加里程碑">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <div id="milestoneList" class="mt-5 space-y-2.5"></div>
        </section>
      </div>
    </div>
  `;
  renderNotes();
  renderMilestones();
}
