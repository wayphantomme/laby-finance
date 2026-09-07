"use client";

import { useState, useEffect } from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { UnifiedChat } from "@/components/ai/unified-chat";
import { ChatHistory } from "@/components/ai/chat-history";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface ChatSessionFull {
  id: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
}

export default function AIPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [txRefresh, setTxRefresh] = useState(0);

  async function loadSession(id: string) {
    const res = await fetch(`/api/ai/sessions/${id}`);
    const data = await res.json() as { session: ChatSessionFull };
    if (data.session?.messages) {
      setSessionMessages(
        data.session.messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      );
    }
    setActiveSessionId(id);
    setSidebarOpen(false);
  }

  function handleNewChat() {
    setActiveSessionId(null);
    setSessionMessages([]);
    setSidebarOpen(false);
  }

  function handleFirstMessage(id: string) {
    setActiveSessionId(id);
    setHistoryRefresh((k) => k + 1);
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-4rem)] -m-4 lg:-m-6">

      {/* ── History sidebar — desktop always visible, mobile slide-in ── */}
      <>
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={cn(
          "flex flex-col border-r border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900",
          "transition-all duration-250 ease-out",
          // Desktop: always visible, fixed width
          "hidden lg:flex lg:w-60 lg:relative",
          // Mobile: absolute overlay, toggled
          sidebarOpen && "flex fixed inset-y-0 left-0 z-40 w-72 lg:relative"
        )}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">History</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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
        </aside>
      </>

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Mobile: toggle history button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
          aria-label="Open chat history"
        >
          <PanelLeftOpen className="h-4 w-4" />
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
