"use client";

import { useState } from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedChat } from "@/components/ai/unified-chat";
import { ChatHistory } from "@/components/ai/chat-history";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  // drafts typed loosely here; UnifiedChat will cast to TransactionDraft[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drafts?: any[];
}

interface ChatSessionFull {
  id: string;
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: string;
    metadata?: { drafts?: unknown[]; imageUrl?: string } | null;
  }[];
}

export default function AIPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  // Desktop: collapsed by default when no history; mobile: always starts closed
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setTxRefresh] = useState(0);

  async function loadSession(id: string) {
    const res = await fetch(`/api/ai/sessions/${id}`);
    const data = await res.json() as { session: ChatSessionFull };
    if (data.session?.messages) {
      setSessionMessages(
        data.session.messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          imageUrl: m.metadata?.imageUrl ?? undefined,
          drafts: m.metadata?.drafts ?? undefined,
        }))
      );
    }
    setActiveSessionId(id);
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }

  function handleNewChat() {
    setActiveSessionId(null);
    setSessionMessages([]);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }

  function handleFirstMessage(id: string) {
    setActiveSessionId(id);
    setHistoryRefresh((k) => k + 1);
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-4rem)] -m-4 lg:-m-6 overflow-hidden">

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── History sidebar ── */}
      {/* Desktop: inline, animated width */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 0 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shrink-0"
        )}
        style={{ minWidth: 0 }}
      >
        <div className="w-60">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 whitespace-nowrap">History</span>
          </div>
          <ChatHistory
            activeSessionId={activeSessionId}
            onSelectSession={loadSession}
            onNewChat={handleNewChat}
            refreshKey={historyRefresh}
          />
        </div>
      </motion.aside>

      {/* Mobile: fixed overlay sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-40 flex flex-col w-72 border-r border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">History</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
            <ChatHistory
              activeSessionId={activeSessionId}
              onSelectSession={loadSession}
              onNewChat={handleNewChat}
              refreshKey={historyRefresh}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Toggle button — always visible, top-left of chat area */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={cn(
            "absolute top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            "text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700",
            sidebarOpen ? "left-3 lg:left-3" : "left-3"
          )}
          aria-label={sidebarOpen ? "Close history" : "Open history"}
        >
          {sidebarOpen
            ? <PanelLeftClose className="h-4 w-4" />
            : <PanelLeftOpen className="h-4 w-4" />}
        </button>

        <UnifiedChat
          key={activeSessionId ?? "new"}
          sessionId={activeSessionId}
          initialMessages={sessionMessages}
          onTransactionSaved={() => setTxRefresh((k) => k + 1)}
          onFirstMessage={handleFirstMessage}
        />
      </div>
    </div>
  );
}
