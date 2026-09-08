"use client";

import { usePathname } from "next/navigation";
import { User, Menu, Sun, Moon, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

export function Topbar({ userName, onMenuClick }: { userName?: string | null; onMenuClick: () => void }) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const titles: Record<string, string> = {
    "/ai": "Chat",
    "/dashboard": t.titles["/dashboard"] ?? "Dashboard",
    "/transactions": t.titles["/transactions"] ?? "Transactions",
    "/portfolio": "Portfolio",
    "/accounts": t.titles["/accounts"] ?? "Chart of Accounts",
    "/reports": t.titles["/reports"] ?? "Reports",
    "/budget": "Budget",
    "/recurring": "Recurring",
    "/history": t.titles["/history"] ?? "Activity History",
    "/docs": "Docs",
  };

  const base = "/" + pathname.split("/")[1];
  const title = titles[base] ?? "Laby";

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark",  label: "Dark",  icon: Moon },
  ];

  const CurrentThemeIcon = !mounted ? Sun :
    theme === "dark" ? Moon : Sun;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 lg:h-16 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Locale toggle */}
        <button
          onClick={() => setLocale(locale === "en" ? "id" : "en")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
            "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
          )}
          aria-label="Toggle language"
          title={locale === "en" ? "Switch to Indonesian" : "Switch to English"}
        >
          <Languages className="h-3.5 w-3.5" />
          {locale.toUpperCase()}
        </button>

        {/* Theme toggle */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            <CurrentThemeIcon className="h-4 w-4" />
          </button>
          {themeOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden z-50">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setThemeOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    theme === value
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 pl-1 text-sm text-gray-600 dark:text-slate-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{userName ?? t.common.account}</span>
        </div>
      </div>
    </header>
  );
}
