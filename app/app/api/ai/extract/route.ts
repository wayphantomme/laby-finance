import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const EXTRACT_PROMPT = `You are analyzing a screenshot of a bank statement, e-wallet transaction, or financial document.

Extract ALL transactions visible in the image. For each transaction, output a JSON array with this exact structure:

[
  {
    "date": "YYYY-MM-DD",
    "description": "transaction description",
    "amount": 150000,
    "type": "expense",
    "suggestedAccount": "5-101",
    "suggestedAccountName": "Food & Beverages",
    "confidence": "high"
  }
]

Rules:
- amount: always positive integer in IDR (no decimals, no currency symbols)
- type: "income" (money received), "expense" (money spent), or "transfer" (between own accounts)
- date: use today's date if not visible in the image
- suggestedAccount: pick the best match from this chart of accounts:
  Income: 4-101 Salary, 4-102 Freelance/Project, 4-103 Business Revenue, 4-201 Dividends, 4-202 Interest, 4-203 Realized Capital Gain, 4-301 Prize/Grant/Competition
  Expense: 5-101 Food & Beverages, 5-102 Transport, 5-103 Housing/Rent, 5-104 Utilities, 5-105 Healthcare, 5-201 Entertainment, 5-202 Shopping, 5-203 Subscriptions, 5-204 Education, 6-101 Software & Subscriptions, 6-102 Equipment, 6-103 Internet & Communication, 6-201 Loan Interest, 6-202 Bank Admin Fees, 6-301 PPh Final UMKM, 6-302 Income Tax
- confidence: "high" if amount and date are clearly visible, "low" if estimated
- If no transactions are visible, return an empty array []
- Return ONLY the JSON array, no explanation text`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Upload a JPEG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const model = genai.getGenerativeModel({ model: "gemini-3.6-flash" });

    const result = await model.generateContent([
      { text: EXTRACT_PROMPT },
      {
        inlineData: {
          mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
          data: base64,
        },
      },
    ]);

    const rawText = result.response.text().trim();

    // Strip markdown code fences if present
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let transactions: unknown[];
    try {
      transactions = JSON.parse(jsonText);
      if (!Array.isArray(transactions)) {
        transactions = [];
      }
    } catch {
      console.error("Gemini returned non-JSON:", rawText);
      transactions = [];
    }

    // Fetch CoA accounts to enrich draft with account IDs
    const accounts = await prisma.coaAccount.findMany({
      where: { isActive: true, parentId: { not: null } },
      select: { id: true, code: true, nameEn: true, type: true },
    });
    const codeToAccount = Object.fromEntries(accounts.map((a) => [a.code, a]));

    // Also find default cash account (1-102 Bank Account)
    const defaultCash = accounts.find((a) => a.code === "1-102");

    const drafts = (transactions as {
      date?: string;
      description?: string;
      amount?: number;
      type?: string;
      suggestedAccount?: string;
      suggestedAccountName?: string;
      confidence?: string;
    }[]).map((tx) => {
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

    return NextResponse.json({ drafts, rawCount: transactions.length });
  } catch (e) {
    console.error("Extract error:", e);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
