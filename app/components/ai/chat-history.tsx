"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, MessageSquare, RefreshCw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatSessionItem {
  id: string;
  title: string | null;
  createdAt: string;
  messages: { content: string }[];
  _count: { messages: number };
}

interface ChatHistoryProps {
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  refreshKey?: number;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function ChatHistory({ activeSessionId, onSelectSession, onNewChat, refreshKey = 0 }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/sessions");
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions, refreshKey]);

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setConfirmId(id);
  }

  async function confirmDelete() {
    if (!confirmId) return;
    setDeleting(confirmId);
    setConfirmId(null);
    await fetch(`/api/ai/sessions/${confirmId}`, { method: "DELETE" });
    if (activeSessionId === confirmId) onNewChat();
    setDeleting(null);
    fetchSessions();
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Delete confirm modal ── */}
      <AnimatePresence>
        {confirmId && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Delete conversation?</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmId(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-lg px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* New chat button */}
      <div className="p-3 border-b border-gray-100 dark:border-slate-700">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-600"
        >
          <Plus className="h-4 w-4 shrink-0" />
          New chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 dark:text-slate-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const preview = session.messages[0]?.content ?? "New conversation";
              return (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    "group w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors relative",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <MessageSquare className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", isActive ? "text-primary-500" : "text-gray-400 dark:text-slate-500")} />
                  <div className="flex-1 min-w-0 pr-6">
                    <p className={cn("text-sm truncate leading-snug",
                      isActive ? "text-primary-700 dark:text-primary-400 font-medium" : "text-gray-700 dark:text-slate-300")}>
                      {session.title ?? preview}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                      {formatRelativeTime(session.createdAt)} · {session._count.messages} msg
                    </p>
                  </div>
                  {/* Delete button — appears on hover */}
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    disabled={deleting === session.id}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 dark:text-slate-500 hover:text-red-400 disabled:opacity-50 transition-all"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
