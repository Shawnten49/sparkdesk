import { $, escapeHtml } from "./dom.js";

export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const color = type === "error"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-white text-stone-700";
  toast.className = `pointer-events-auto fade-in flex items-start gap-3 rounded-xl border ${color} px-4 py-3 text-sm shadow-soft`;
  toast.innerHTML = `
    <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${type === "error" ? "bg-red-100" : "bg-emerald-100"} text-xs">${type === "error" ? "!" : "✓"}</span>
    <span class="leading-5">${escapeHtml(message)}</span>
  `;
  $("#toastContainer").appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    toast.style.transition = "all .2s ease";
    setTimeout(() => toast.remove(), 220);
  }, 2800);
}
