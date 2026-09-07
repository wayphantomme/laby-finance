"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, BookOpen,
  TrendingUp, PiggyBank, History, LogOut,
  MessageSquare, X, BookMarked,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/lib/i18n/locale-context";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useLocale();

  const navItems = [
    { href: "/ai",           label: t.nav.chat,         icon: MessageSquare },
    { href: "/dashboard",    label: t.nav.dashboard,    icon: LayoutDashboard },
    { href: "/transactions", label: t.nav.transactions, icon: ArrowLeftRight },
    { href: "/accounts",     label: t.nav.accounts,     icon: BookOpen },
    { href: "/reports",      label: t.nav.reports,      icon: TrendingUp },
    { href: "/history",      label: t.nav.history,      icon: History },
  ];

  const navContent = (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 dark:border-slate-700 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
          <PiggyBank className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-gray-900 dark:text-slate-100 leading-none">Laby</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-none mt-0.5">Personal Finance</p>
        </div>
        <button
          onClick={onClose}
          className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-slate-500")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 dark:border-slate-700 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-0.5">
        {/* Docs link — above sign out */}
        <Link
          href="/docs"
          onClick={onClose}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/docs" || pathname.startsWith("/docs/")
              ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
              : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100"
          )}
        >
          <BookMarked className={cn(
            "h-4 w-4 shrink-0",
            pathname === "/docs" || pathname.startsWith("/docs/")
              ? "text-primary-600 dark:text-primary-400"
              : "text-gray-400 dark:text-slate-500"
          )} />
          {t.nav.docs}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0 text-gray-400 dark:text-slate-500" />
          {t.nav.signOut}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
        {navContent}
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 lg:hidden"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
