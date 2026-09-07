"use client";

import { usePathname } from "next/navigation";
import { User, Menu } from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/accounts": "Chart of Accounts",
  "/reports": "Reports",
  "/history": "Activity History",
  "/ai": "Chat",
};

interface TopbarProps {
  userName?: string | null;
  onMenuClick: () => void;
}

export function Topbar({ userName, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const base = "/" + pathname.split("/")[1];
  const title = titles[base] ?? "Laby";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4 lg:h-16 lg:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-gray-900 lg:ml-0 ml-2">{title}</h1>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden sm:inline">{userName ?? "Account"}</span>
      </div>
    </header>
  );
}
