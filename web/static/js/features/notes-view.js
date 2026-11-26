import { escapeHtml, formatTime } from "../core/dom.js";
import { renderMarkdown } from "../core/markdown.js";
import { NOTE_META } from "../core/constants.js";
import { getState } from "../core/store.js";

export function renderNoteComposer() {
  const state = getState();
  const editing = Boolean(state.editingNoteId);
  const placeholder = state.noteKind === "link"
    ? "粘贴一个网页链接，例如 https://example.com/article"
    : state.noteKind === "revision"
      ? "记录这次想法发生了什么变化，以及为什么改变…"
      : "记一点碎片、资料摘要或下一步设想…支持 Markdown";
  return `
    <form id="noteForm" class="mt-5 rounded-2xl border border-black/[0.07] bg-white p-3 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex gap-1" data-note-kinds>
          ${Object.entries(NOTE_META).map(([key, meta]) => `
            <button type="button" data-note-kind="${key}" class="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${state.noteKind === key ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100"}">
              <span class="mr-1">${meta.icon}</span>${meta.label}
            </button>
          `).join("")}
        </div>
        <span class="pr-1 text-[10px] text-stone-300">${editing ? "正在编辑" : "Ctrl / ⌘ + Enter 提交"}</span>
      </div>
      <textarea id="noteContentInput" rows="3" maxlength="20000" placeholder="${placeholder}" class="mt-3 w-full resize-y rounded-xl border border-black/[0.07] bg-stone-50/70 px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-stone-300 focus:border-moss/40 focus:bg-white focus:ring-4 focus:ring-moss/5"></textarea>
      <div class="mt-2 flex items-center justify-between gap-3">
        <span class="pl-1 text-[10px] text-stone-400">${editing ? "修改会更新原记录" : "保存即时生效"}</span>
        <div class="flex gap-2">
          ${editing ? `<button type="button" data-action="cancel-note-edit" class="rounded-lg px-3 py-2 text-xs font-medium text-stone-400 hover:bg-stone-100">取消</button>` : ""}
          <button type="submit" class="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-black">${editing ? "更新记录" : "添加记录"}</button>
        </div>
      </div>
    </form>
  `;
}

export function renderNotes() {
  const state = getState();
  const list = document.querySelector("#noteList");
  if (!list) return;
  if (!state.notes.length) {
    list.innerHTML = `
      <div class="rounded-2xl border border-dashed border-stone-200 px-5 py-10 text-center">
        <p class="text-sm font-medium text-stone-500">这里还很安静</p>
        <p class="mt-1 text-xs leading-5 text-stone-400">从一条随手记或资料链接开始。</p>
      </div>`;
    return;
  }
  list.innerHTML = state.notes.map(note => {
    const meta = NOTE_META[note.kind] || NOTE_META.text;
    const edited = note.updated_at !== note.created_at;
    let body;
    if (note.kind === "link") {
      const safeLink = /^https?:\/\/\S+$/i.test(note.content);
      body = safeLink
        ? `<a href="${escapeHtml(note.content)}" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50">
             <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">↗</span>
             <span class="min-w-0 flex-1">
               <span class="block text-[11px] font-semibold text-emerald-700">外部资料</span>
               <span class="mt-0.5 block truncate text-xs text-stone-500">${escapeHtml(note.content)}</span>
             </span>
           </a>`
        : `<div class="markdown">${renderMarkdown(note.content)}</div>`;
    } else {
      body = `<div class="markdown">${renderMarkdown(note.content)}</div>`;
    }
    return `
      <article class="fade-in group relative rounded-2xl border border-black/[0.07] bg-white/70 p-4 transition hover:border-black/10 hover:bg-white">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-md ${note.kind === "revision" ? "bg-orange-50 text-coral" : note.kind === "link" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"} text-xs">${meta.icon}</span>
            <span class="text-[11px] font-semibold text-stone-500">${meta.label}</span>
            <span class="text-[10px] text-stone-300">${formatTime(note.created_at)}${edited ? " · 已编辑" : ""}</span>
          </div>
          <div class="flex gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button data-action="edit-note" data-note-id="${note.id}" class="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-ink" aria-label="编辑记录">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m13.5 8 3 3"/></svg>
            </button>
            <button data-action="delete-note" data-note-id="${note.id}" class="rounded-md p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-500" aria-label="删除记录">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13"/></svg>
            </button>
          </div>
        </div>
        ${body}
      </article>
    `;
  }).join("");
}
