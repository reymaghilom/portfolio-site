"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  DARK_QUERY,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// One shared store for every toggle on the page; localStorage is read once, then cached.
let preference: ThemePreference | null = null;
const listeners = new Set<() => void>();

function readStoredPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function getPreference(): ThemePreference {
  preference ??= readStoredPreference();
  return preference;
}

function resolve(value: ThemePreference): ResolvedTheme {
  if (value !== "system") return value;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/* ---------- The sheet: the old theme peels away to reveal the new one ----------
   The live page switches theme immediately and stays fully interactive. On top of
   it sits an inert, pointer-events:none copy of the page in the old theme, which is
   clipped away along the sheet's edge (see .theme-sheet in globals.css).
   This replaces a View Transition: while one runs, browsers hit-test the whole
   document as <html>, so nothing on the page could be clicked until it ended. */

let finishActiveSheet: (() => void) | null = null;

const SKIP_IN_SHEET = "script, template, noscript, nextjs-portal, next-route-announcer";

function playSheet(from: ResolvedTheme) {
  // A sheet mid-turn lands instantly; the new one starts from what is on screen now.
  finishActiveSheet?.();

  const layer = document.createElement("div");
  layer.className = "theme-sheet";
  layer.setAttribute("data-theme", from);
  layer.setAttribute("aria-hidden", "true");
  layer.inert = true;
  for (const child of document.body.children) {
    if (!child.matches(SKIP_IN_SHEET)) layer.append(child.cloneNode(true));
  }
  layer.querySelectorAll(SKIP_IN_SHEET).forEach((node) => node.remove());
  // Keep anchors and getElementById pointing at the live page (SVG-internal ids stay).
  layer.querySelectorAll("[id]:not(svg [id])").forEach((node) => node.removeAttribute("id"));

  document.body.append(layer);
  const syncScroll = () => (layer.scrollTop = window.scrollY);
  syncScroll();

  const finish = () => {
    if (finishActiveSheet !== finish) return;
    finishActiveSheet = null;
    clearTimeout(safetyTimer);
    window.removeEventListener("scroll", syncScroll);
    window.removeEventListener("resize", finish);
    layer.remove();
  };
  finishActiveSheet = finish;

  window.addEventListener("scroll", syncScroll, { passive: true });
  window.addEventListener("resize", finish);
  Promise.allSettled(layer.getAnimations().map((animation) => animation.finished)).then(finish);
  // Never let the layer outlive its animation (e.g. a throttled background tab).
  const safetyTimer = setTimeout(finish, 2500);
}

function applyTheme(animate: boolean) {
  const root = document.documentElement;
  const value = getPreference();
  const next = resolve(value);
  root.setAttribute("data-theme-preference", value);

  const current = root.getAttribute("data-theme");
  if (current === next) return;

  if (
    animate &&
    (current === "light" || current === "dark") &&
    !window.matchMedia(REDUCED_MOTION_QUERY).matches
  ) {
    playSheet(current);
  } else {
    finishActiveSheet?.();
  }
  root.setAttribute("data-theme", next);
}

function emit() {
  listeners.forEach((listener) => listener());
}

/* ---------- Outside changes: other tabs and the OS setting ---------- */

function onStorage(event: StorageEvent) {
  // key is null when storage was cleared.
  if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
  preference = readStoredPreference();
  applyTheme(false);
  emit();
}

function onSystemChange() {
  if (getPreference() === "system") applyTheme(true);
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
    window.matchMedia(DARK_QUERY).addEventListener("change", onSystemChange);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      window.matchMedia(DARK_QUERY).removeEventListener("change", onSystemChange);
    }
  };
}

export function setThemePreference(next: ThemePreference) {
  try {
    if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage unavailable (private mode etc.) — still apply for this visit.
  }
  preference = next;
  applyTheme(true);
  emit();
}

/** Current theme preference, shared by every toggle on the page. */
export function useThemePreference(): ThemePreference {
  const value = useSyncExternalStore(subscribe, getPreference, () => "system" as const);

  // React's dev remount clears the attributes set by the inline script; restore them.
  useLayoutEffect(() => {
    applyTheme(false);
  }, []);

  return value;
}
