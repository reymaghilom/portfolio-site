"use client";

import type { ComponentType, SVGProps } from "react";
import { setThemePreference, useThemePreference } from "@/hooks/useTheme";
import type { ThemePreference } from "@/lib/theme";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

const options: {
  value: ThemePreference;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
];

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const preference = useThemePreference();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`inline-flex items-center gap-0.5 rounded-full border border-gray-200 p-0.5 ${className}`}
    >
      {options.map(({ value, label, Icon }) => (
        // The selected style comes from data-theme-preference on <html> (globals.css),
        // so it is right on first paint, before hydration.
        <button
          key={value}
          type="button"
          data-theme-option={value}
          aria-pressed={preference === value}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => setThemePreference(value)}
          className="grid size-7 place-items-center rounded-full text-gray-500 transition-colors duration-200 hover:text-ink"
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
