"use client";
import { useCallback } from "react";

type ToastType = "success" | "error" | "info";

function getOrCreateContainer(): HTMLElement {
  let el = document.getElementById("toast-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-container";
    Object.assign(el.style, {
      position: "fixed",
      bottom: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "99999",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      alignItems: "center",
    });
    document.body.appendChild(el);
  }
  return el;
}

export function showToast(msg: string, type: ToastType = "success") {
  const tc = getOrCreateContainer();
  const bg =
    type === "error"
      ? "#ef4444"
      : type === "info"
        ? "#3b82f6"
        : "linear-gradient(135deg,#B42225,#FF8C00)";

  const t = document.createElement("div");
  Object.assign(t.style, {
    background: bg,
    color: "#fff",
    padding: "11px 20px",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "var(--font-sora), sans-serif",
    boxShadow: "0 8px 28px rgba(0,0,0,.2)",
    whiteSpace: "nowrap",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity .3s, transform .3s",
    pointerEvents: "none",
  });
  t.setAttribute("role", "status");
  t.textContent = msg;
  tc.appendChild(t);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateY(0)";
    }),
  );
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(8px)";
    setTimeout(() => t.remove(), 400);
  }, 2800);
}

export function useToast() {
  return useCallback(
    (message: string, type?: ToastType) => showToast(message, type),
    [],
  );
}
