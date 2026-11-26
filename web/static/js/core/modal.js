import { $, $$ } from "./dom.js";

let confirmResolver = null;

export function openModal(id) {
  const modal = $(`#${id}`);
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  setTimeout(
    () => $("input:not([type=hidden]), textarea", modal)?.focus(),
    30
  );
}

export function closeModal(id) {
  const modal = $(`#${id}`);
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  if (!$$(".fixed.inset-0.flex").length) {
    document.body.style.overflow = "";
  }
}

export function confirmAction({
  title,
  message,
  confirmText = "确认删除",
  danger = true
}) {
  $("#confirmTitle").textContent = title;
  $("#confirmMessage").textContent = message;
  $("#confirmOkBtn").textContent = confirmText;
  $("#confirmOkBtn").className = `rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${danger ? "bg-red-600 hover:bg-red-700" : "bg-ink hover:bg-black"}`;
  openModal("confirmModal");
  return new Promise(resolve => {
    confirmResolver = resolve;
  });
}

function resolveConfirm(result) {
  closeModal("confirmModal");
  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

export function bindModalEvents() {
  $$("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => {
      closeModal(button.dataset.closeModal);
    });
  });

  $$("[data-confirm]").forEach(button => {
    button.addEventListener("click", () => {
      resolveConfirm(button.dataset.confirm === "ok");
    });
  });
  $("#confirmOkBtn").addEventListener("click", () => resolveConfirm(true));

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!$("#confirmModal").classList.contains("hidden")) {
      resolveConfirm(false);
      return;
    }
    const openModalElement = $$(".fixed.inset-0.flex").pop();
    if (openModalElement) closeModal(openModalElement.id);
  });
}
