import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { formatRupiah } from "@/lib/format";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function buildFinancialContext(userId: string): Promise<string> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [lines, recentEntries] = await Promise.all([
    prisma.journalLine.findMany({
      where: {
        journalEntry: {
          userId, status: "CONFIRMED", deletedAt: null,
          entryDate: { gte: startOfYear },
        },
      },
      include: {
        account: true,
        journalEntry: { select: { entryDate: true, description: true } },
      },
    }),
    prisma.journalEntry.findMany({
      where: { userId, status: "CONFIRMED", deletedAt: null },
      orderBy: { entryDate: "desc" },
      take: 10,
      include: { lines: { include: { account: true } } },
    }),
  ]);

  let ytdIncome = 0, ytdExpense = 0, mtdIncome = 0, mtdExpense = 0;
  let totalAssets = 0, totalLiabilities = 0;
  const expByCategory: Record<string, number> = {};

  for (const line of lines) {
    const type = line.account.type;
    const ed = new Date(line.journalEntry.entryDate);
    const inMonth = ed >= startOfMonth;
    if (type === "INCOME") {
      const amt = line.credit - line.debit;
      ytdIncome += amt; if (inMonth) mtdIncome += amt;
    } else if (type === "EXPENSE") {
      const amt = line.debit - line.credit;
      ytdExpense += amt;
      if (inMonth) { mtdExpense += amt; expByCategory[line.account.nameEn] = (expByCategory[line.account.nameEn] ?? 0) + amt; }
    } else if (type === "ASSET") totalAssets += line.debit - line.credit;
    else if (type === "LIABILITY") totalLiabilities += line.credit - line.debit;
  }

  const topExp = Object.entries(expByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([k, v]) => `  - ${k}: ${formatRupiah(v)}`).join("\n");

  const recentTx = recentEntries.slice(0, 10).map((e) => {
    const il = e.lines.find((l) => l.account.type === "INCOME");
    const el = e.lines.find((l) => l.account.type === "EXPENSE");
    const l = il ?? el ?? e.lines[0];
    const amt = l ? (il ? l.credit - l.debit : l.debit - l.credit) : 0;
    return `  - ${new Date(e.entryDate).toLocaleDateString("id-ID")}: ${e.description} (${il ? "income" : el ? "expense" : "transfer"}, ${formatRupiah(amt)})`;
  }).join("\n");

  return `== FINANCIAL DATA (${now.toLocaleDateString("id-ID")}) ==
Net Worth: ${formatRupiah(totalAssets - totalLiabilities)}
Total Assets: ${formatRupiah(totalAssets)} | Total Liabilities: ${formatRupiah(totalLiabilities)}
YTD ${now.getFullYear()} — Income: ${formatRupiah(ytdIncome)} | Expenses: ${formatRupiah(ytdExpense)} | Net: ${formatRupiah(ytdIncome - ytdExpense)}
This Month — Income: ${formatRupiah(mtdIncome)} | Expenses: ${formatRupiah(mtdExpense)} | Cash Flow: ${formatRupiah(mtdIncome - mtdExpense)}
Top Expense Categories:\n${topExp || "  (none)"}
Recent Transactions:\n${recentTx || "  (none)"}`;
}

const SYSTEM_PROMPT_BASE = `You are a personal financial assistant for Laby, a professional personal accounting app.

Your role:
- Answer questions about the user's financial data clearly and concisely
- When an image is provided, analyze it as a financial document (bank statement, e-wallet screenshot, receipt, portfolio statement, etc.)
- Extract transactions OR portfolio holdings from images and return them as structured JSON
- Help interpret financial reports and suggest improvements

CRITICAL RULE: When you see a portfolio/investment screenshot, you MUST output a \`\`\`holdings JSON block. NEVER output a button or say "eksekusi". ALWAYS output the structured JSON so the app can render import cards.

Portfolio screenshots include:
- Crypto wallets: Phantom, MetaMask, Trust Wallet, Pintu, Indodax, Tokocrypto, Binance
- Stock brokers: Ajaib, Stockbit, Gotrade, IPOT, BNI Sekuritas
- Any screen showing asset names, tickers, quantities/balances

EXTRACTION RULES (follow these exactly):
1. Scan the ENTIRE image top-to-bottom — do NOT stop after the first token.
2. Extract EVERY asset/token visible, even stablecoins (USDC, USDT, USDG) and small balances.
3. If the list is scrollable or cut off, extract all that are visible.
4. Each token = one entry in the array. Never merge or skip.
5. For Phantom wallet: the list shows token name, quantity, and USD value — extract all rows.

For PORTFOLIO screenshots, ALWAYS output a holdings JSON block at the end of your response:

\`\`\`holdings
[
  {
    "assetName": "Solana",
    "ticker": "SOL",
    "assetType": "crypto",
    "quantity": 0.9376112,
    "lots": null,
    "avgBuyPrice": 0,
    "currency": "USD",
    "confidence": "high"
  },
  {
    "assetName": "USD Coin",
    "ticker": "USDC",
    "assetType": "crypto",
    "quantity": 383.98,
    "lots": null,
    "avgBuyPrice": 1,
    "currency": "USD",
    "confidence": "high"
  }
]
\`\`\`

assetType values: "stock_idx" (IDX stocks), "stock_us" (US stocks), "crypto", "gold", "mutual_fund", "other"
avgBuyPrice: use 1 for stablecoins (USDC, USDT, USDG, DAI, BUSD), use 0 for everything else (user fills manually)
currency: "USD" for US/crypto assets, "IDR" for IDX stocks
For IDX stocks: quantity = lots × 100, include both quantity and lots
For crypto: quantity in exact units shown (e.g. 0.9376112 for SOL)
DO NOT output any button, link, or "eksekusi" text — the app handles import automatically via the JSON block.

Rules:
- Base all answers on the actual financial data below — never fabricate numbers
- Use IDR formatting with dot-thousands (e.g. Rp1.500.000)
- Be direct and concise — no filler phrases, no em dashes, no emoji
- When extracting transactions from an image, ALWAYS include a JSON block at the end of your response in this exact format:

\`\`\`transactions
[
  {
    "date": "YYYY-MM-DD",
    "description": "description",
    "amount": 150000,
    "type": "expense",
    "suggestedAccount": "5-101",
    "suggestedAccountName": "Food & Beverages",
    "confidence": "high"
  }
]
\`\`\`

Account codes for suggestions:
Income: 4-101 Salary, 4-102 Freelance/Project, 4-103 Business Revenue, 4-201 Dividends, 4-202 Interest, 4-203 Capital Gain, 4-301 Prize/Grant
Expense: 5-101 Food & Beverages, 5-102 Transport, 5-103 Housing/Rent, 5-104 Utilities, 5-105 Healthcare, 5-201 Entertainment, 5-202 Shopping, 5-203 Subscriptions, 5-204 Education, 6-101 Software, 6-102 Equipment, 6-103 Internet, 6-201 Loan Interest, 6-202 Bank Fees, 6-301 PPh Final, 6-302 Income Tax`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let messages: { role: "user" | "assistant"; content: string }[] = [];
    let imageBase64: string | null = null;
    let imageMimeType: string = "image/jpeg";
    let sessionId: string | null = null;
    let uploadedImageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const messagesRaw = form.get("messages");
      messages = messagesRaw ? JSON.parse(messagesRaw as string) : [];
      sessionId = form.get("sessionId") as string | null;
      const file = form.get("image") as File | null;
      if (file) {
        const buf = await file.arrayBuffer();
        const imageBuffer = Buffer.from(buf);
        imageBase64 = imageBuffer.toString("base64");
        imageMimeType = file.type || "image/jpeg";

        // Upload to Cloudinary for permanent storage (shown in history)
        try {
          uploadedImageUrl = await uploadImageToCloudinary(imageBuffer, imageMimeType);
        } catch (uploadErr) {
          // Non-fatal: AI extraction still works, image just won't persist in history
          console.warn("Cloudinary upload failed:", uploadErr);
        }
      }
    } else {
      const body = await req.json();
      messages = body.messages ?? [];
      sessionId = body.sessionId ?? null;
    }

    if (!messages.length) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    const financialContext = await buildFinancialContext(session.user.id);

    // Inject server-side date so AI knows today and "yesterday" correctly
    // Timezone: Asia/Makassar = WITA = UTC+8 (Bali)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Makassar",
      year: "numeric", month: "long", day: "numeric", weekday: "long",
    });
    const isoFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Makassar",
      year: "numeric", month: "2-digit", day: "2-digit",
    });
    const todayStr = formatter.format(now);
    const todayISO = isoFormatter.format(now);
    const yesterdayISO = isoFormatter.format(new Date(now.getTime() - 86400000));

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

== DATE CONTEXT ==
Today is: ${todayStr} (${todayISO})
Yesterday was: ${yesterdayISO}
When user says "kemarin" or "yesterday", use date: ${yesterdayISO}
When user says "tadi" or "today" or "barusan", use date: ${todayISO}
Always use YYYY-MM-DD format for dates in the transactions JSON.

${financialContext}`;

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user" as "user" | "model",
      parts: [{ text: m.content }],
    }));

    const model = genai.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    // Build parts: text + optional image
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
      { text: lastMessage.content || (imageBase64 ? "Analyze this image and extract all transactions." : "") },
    ];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType as "image/jpeg" | "image/png" | "image/webp",
          data: imageBase64,
        },
      });
    }

    const result = await chat.sendMessage(parts);
    const responseText = result.response.text();

    // Parse transaction drafts from response if present
    let drafts: unknown[] | null = null;
    const txMatch = responseText.match(/```transactions\s*([\s\S]*?)```/);
    if (txMatch) {
      try { drafts = JSON.parse(txMatch[1].trim()); } catch { drafts = null; }
    }

    // Parse portfolio holdings from response if present
    let holdings: unknown[] | null = null;
    const holdingsMatch = responseText.match(/```holdings\s*([\s\S]*?)```/);
    if (holdingsMatch) {
      try {
        const rawHoldings = JSON.parse(holdingsMatch[1].trim());
        // Enrich with account IDs
        const investmentAccounts = await prisma.coaAccount.findMany({
          where: { isActive: true, code: { startsWith: "1-3" }, NOT: { code: { endsWith: "-000" } } },
          select: { id: true, code: true, nameEn: true },
        });
        const accountByType: Record<string, string> = {
          stock_idx: investmentAccounts.find((a) => a.code === "1-301")?.id ?? "",
          stock_us: investmentAccounts.find((a) => a.code === "1-301")?.id ?? "",
          crypto: investmentAccounts.find((a) => a.code === "1-302")?.id ?? "",
          mutual_fund: investmentAccounts.find((a) => a.code === "1-303")?.id ?? "",
          gold: investmentAccounts.find((a) => a.code === "1-304")?.id ?? "",
          other: investmentAccounts.find((a) => a.code === "1-301")?.id ?? "",
        };
        holdings = (rawHoldings as { assetName?: string; ticker?: string; assetType?: string; quantity?: number; lots?: number; avgBuyPrice?: number; currency?: string; confidence?: string }[]).map((h) => ({
          assetName: h.assetName ?? h.ticker ?? "",
          ticker: (h.ticker ?? "").toUpperCase(),
          assetType: h.assetType ?? "other",
          quantity: h.quantity ?? 0,
          lots: h.lots ?? null,
          avgBuyPriceIdr: h.avgBuyPrice ?? 0,
          accountId: accountByType[h.assetType ?? "other"] ?? "",
          currency: h.currency ?? "IDR",
          confidence: h.confidence ?? "low",
        }));
      } catch { holdings = null; }
    }

    // Enrich drafts with account IDs
    if (drafts?.length) {
      const accounts = await prisma.coaAccount.findMany({
        where: { isActive: true, parentId: { not: null } },
        select: { id: true, code: true, nameEn: true, type: true },
      });
      const codeToAccount = Object.fromEntries(accounts.map((a) => [a.code, a]));
      const defaultCash = accounts.find((a) => a.code === "1-102");

      drafts = (drafts as { date?: string; description?: string; amount?: number; type?: string; suggestedAccount?: string; suggestedAccountName?: string; confidence?: string }[]).map((tx) => {
        const account = codeToAccount[tx.suggestedAccount ?? ""];
        return {
          date: tx.date ?? new Date().toISOString().split("T")[0],
          description: tx.description ?? "",
          amountIdr: tx.amount ?? 0,
          transactionType: (tx.type?.toUpperCase() ?? "EXPENSE") as "INCOME" | "EXPENSE" | "TRANSFER",
          accountId: account?.id ?? null,
          accountCode: tx.suggestedAccount ?? "",
          accountName: account?.nameEn ?? tx.suggestedAccountName ?? "",
          cashAccountId: defaultCash?.id ?? null,
          confidence: tx.confidence ?? "low",
        };
      });
    }

    const displayText = responseText.replace(/```transactions[\s\S]*?```/g, "").replace(/```holdings[\s\S]*?```/g, "").trim();

    // Persist messages to DB if sessionId provided
    if (sessionId) {
      const lastUserMsg = messages[messages.length - 1];
      await prisma.chatMessage.createMany({
        data: [
          {
            chatSessionId: sessionId,
            role: "user",
            content: lastUserMsg.content,
            // Persist Cloudinary URL so image is visible when loading history
            metadata: uploadedImageUrl
              ? ({ imageUrl: uploadedImageUrl } as Prisma.InputJsonValue)
              : undefined,
          },
          {
            chatSessionId: sessionId,
            role: "assistant",
            content: displayText,
            // Persist drafts + holdings so they can be restored from history
            metadata: (drafts?.length || holdings?.length)
              ? ({
                  ...(drafts?.length ? { drafts } : {}),
                  ...(holdings?.length ? { holdings } : {}),
                } as Prisma.InputJsonValue)
              : undefined,
          },
        ],
      });

      // Auto-set session title from first user message if not set
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { title: true },
      });
      if (!chatSession?.title && lastUserMsg.content) {
        const title = lastUserMsg.content.slice(0, 60).trim();
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { title },
        });
      }
    }

    return NextResponse.json({ content: displayText, drafts, holdings, imageUrl: uploadedImageUrl });
  } catch (e) {
    console.error("AI chat error:", e);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
