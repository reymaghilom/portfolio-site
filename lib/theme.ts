export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs in <head> before first paint: resolves the saved preference
 * (defaulting to system) and sets data-theme on <html> to avoid a flash.
 * data-theme-preference lets the toggle show the right option before hydration.
 */
export const themeInitScript = `(function(){var p;try{p=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(p!=="light"&&p!=="dark")p="system";var d=p==="dark"||(p==="system"&&window.matchMedia("${DARK_QUERY}").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.setAttribute("data-theme-preference",p)})()`;
