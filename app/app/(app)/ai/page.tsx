"use client";

import { useState } from "react";
import { UnifiedChat } from "@/components/ai/unified-chat";

export default function AIPage() {
  const [, setRefreshKey] = useState(0);

  return (
    // Mobile topbar: h-14 (3.5rem), Desktop: h-16 (4rem)
    // Use 100dvh (dynamic viewport height) — fixes iOS Safari URL bar bug
    // -m-4 lg:-m-6 cancels the main padding from AppShell
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-4rem)] -m-4 lg:-m-6">
      <UnifiedChat onTransactionSaved={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
