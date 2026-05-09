import OpenAI from "openai";
import prisma from "@/lib/prisma/client";
import { getPillar, getPage, getBlock, ALL_PILLARS, FINAL_QUESTIONS } from "@/lib/content/contentDefinitions";

const SYSTEM_PROMPT = `Jesteś analitykiem treści stron internetowych dla firmy Profitia. 
Tworzysz precyzyjne, operacyjne podsumowania wyników review contentowych. 
Piszesz po polsku, konkretnie, bez zbędnych ozdobników. 
Skupiaj się na wzorcach, problemach i rekomendacjach — nie na meta-opisie procesu.`;

function getClient(): OpenAI {
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) throw new Error("GITHUB_TOKEN not set");
  return new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey,
  });
}

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildSessionPrompt(data: {
  pillarName: string;
  pages: string[];
  blocks: Array<{ label: string; section: string; currentText: string; approved: boolean; suggestion?: string | null }>;
  finalAnswers: Array<{ question: string; approved: boolean; comment?: string | null }>;
}): string {
  const approved = data.blocks.filter((b) => b.approved).length;
  const rejected = data.blocks.filter((b) => !b.approved).length;

  const changes = data.blocks
    .filter((b) => !b.approved)
    .map((b) => `• [${b.section} / ${b.label}]\n  Aktualnie: "${b.currentText.slice(0, 120)}${b.currentText.length > 120 ? "…" : ""}"\n  Propozycja: "${b.suggestion || "(brak komentarza)"}"`)
    .join("\n");

  const finals = data.finalAnswers
    .map((f) => `• ${f.question}\n  Odpowiedź: ${f.approved ? "TAK" : "NIE"}${f.comment ? `\n  Komentarz: "${f.comment}"` : ""}`)
    .join("\n");

  return `Poniżej wyniki content review filaru "${data.pillarName}" strony Profitia.

Ocenione strony: ${data.pages.join(", ")}
Łącznie bloków: ${data.blocks.length} | Zatwierdzone: ${approved} | Do zmiany: ${rejected}

PROPONOWANE ZMIANY:
${changes || "Brak — wszystko zatwierdzone."}

PYTANIA KOŃCOWE:
${finals || "Brak odpowiedzi."}

Napisz zwięzłe podsumowanie (3–5 zdań) tej sesji review, wskazując:
1. Główne problemy komunikacyjne strony według reviewera
2. Najważniejsze proponowane zmiany
3. Ogólny wydźwięk opinii (czy reviewera jest zadowolony, co mu przeszkadza najbardziej)

Pisz operacyjnie, bez wstępu i bez podsumowania meta-tekstu.`;
}

function buildPillarPrompt(data: {
  pillarName: string;
  sessionCount: number;
  blocks: Array<{
    blockId: string;
    label: string;
    section: string;
    currentText: string;
    totalReviews: number;
    approvedCount: number;
    suggestions: string[];
  }>;
}): string {
  const lowApproval = data.blocks
    .filter((b) => b.totalReviews > 0 && b.approvedCount / b.totalReviews < 0.7)
    .sort((a, b) => a.approvedCount / a.totalReviews - b.approvedCount / b.totalReviews)
    .slice(0, 8)
    .map((b) => {
      const rate = Math.round((b.approvedCount / b.totalReviews) * 100);
      const top = b.suggestions.slice(0, 2).map((s) => `"${s.slice(0, 100)}${s.length > 100 ? "…" : ""}"`).join("; ");
      return `• [${b.section} / ${b.label}] — ${rate}% zatwierdzono (${b.approvedCount}/${b.totalReviews})\n  Przykładowe propozycje: ${top || "(brak komentarzy)"}`;
    })
    .join("\n");

  return `Poniżej zbiorcze wyniki ${data.sessionCount} review filaru "${data.pillarName}" na stronie Profitia.

BLOKI Z NAJNIŻSZYM WSKAŹNIKIEM AKCEPTACJI:
${lowApproval || "Brak — wszystkie bloki mają wysoką akceptację."}

Napisz strategiczne podsumowanie (4–6 zdań) wskazując:
1. Powtarzające się wzorce problemów
2. Które obszary komunikacji wymagają największej uwagi
3. Jakie zmiany byłyby najbardziej skuteczne dla poprawy strony

Pisz analitycznie, operacyjnie. Wskazuj konkretne elementy strony, nie ogólniki.`;
}

function buildPagePrompt(data: {
  pageTitle: string;
  pageUrl: string;
  pillarName: string;
  sessionCount: number;
  blocks: Array<{
    label: string;
    section: string;
    currentText: string;
    totalReviews: number;
    approvedCount: number;
    suggestions: string[];
  }>;
}): string {
  const analysis = data.blocks
    .map((b) => {
      const rate = data.sessionCount > 0 ? Math.round((b.approvedCount / data.sessionCount) * 100) : 0;
      const sug = b.suggestions.slice(0, 3).map((s) => `"${s.slice(0, 120)}${s.length > 120 ? "…" : ""}"`).join("; ");
      return `• [${b.section} / ${b.label}] — ${rate}% akceptacji\n  Aktualnie: "${b.currentText.slice(0, 100)}${b.currentText.length > 100 ? "…" : ""}"\n  Propozycje: ${sug || "(brak)"}`;
    })
    .join("\n");

  return `Poniżej analiza strony "${data.pageTitle}" (${data.pageUrl}) z filaru "${data.pillarName}".
Liczba review: ${data.sessionCount}

ANALIZA BLOKÓW:
${analysis}

Napisz strategic synthesis (4–6 zdań) dla tej strony:
1. Co użytkownicy chcą zmienić najbardziej
2. Co najczęściej akceptują (działa dobrze)
3. Konkretne rekomendacje dla redesignu tej strony

Pisz bezpośrednio, operacyjnie. To ma być instrukcja do iteracji strony.`;
}

// ─── Main summarize function ─────────────────────────────────────────────────

export async function generateAndCacheSummary(
  scope: "session" | "pillar" | "page",
  scopeId: string,
  force = false
): Promise<string> {
  // Check cache
  if (!force) {
    const cached = await prisma.aiSummary.findUnique({ where: { scope_scopeId: { scope, scopeId } } });
    if (cached) return cached.content;
  }

  let prompt: string;

  if (scope === "session") {
    const session = await prisma.contentSession.findUnique({
      where: { id: scopeId },
      include: { blockReviews: true, finalAnswers: true },
    });
    if (!session) throw new Error("Session not found");

    const pillar = getPillar(session.pillarSlug);
    const allBlocks = pillar?.pages.flatMap((p) => p.blocks) ?? [];
    const blocks = session.blockReviews.map((br) => {
      const def = allBlocks.find((b) => b.id === br.blockId);
      return {
        label: def?.label ?? br.blockId,
        section: def?.section ?? "—",
        currentText: def?.currentText ?? "",
        approved: br.approved,
        suggestion: br.suggestion,
      };
    });

    const pages = pillar?.pages
      .filter((p) => p.blocks.some((b) => session.blockReviews.some((br) => br.blockId === b.id)))
      .map((p) => p.title) ?? [];

    const finals = session.finalAnswers.map((fa) => {
      const q = FINAL_QUESTIONS.find((q) => q.id === fa.questionId);
      return { question: q?.question ?? fa.questionId, approved: fa.approved, comment: fa.comment };
    });

    prompt = buildSessionPrompt({ pillarName: pillar?.name ?? session.pillarSlug, pages, blocks, finalAnswers: finals });

  } else if (scope === "pillar") {
    const pillarSlug = scopeId;
    const pillar = getPillar(pillarSlug);
    if (!pillar) throw new Error("Pillar not found");

    const sessions = await prisma.contentSession.findMany({
      where: { pillarSlug, status: "COMPLETED" },
      include: { blockReviews: true },
    });

    const allBlocks = pillar.pages.flatMap((p) => p.blocks);
    const blockMap = new Map<string, { blockId: string; label: string; section: string; currentText: string; totalReviews: number; approvedCount: number; suggestions: string[] }>();

    for (const block of allBlocks) {
      blockMap.set(block.id, { blockId: block.id, label: block.label, section: block.section, currentText: block.currentText, totalReviews: 0, approvedCount: 0, suggestions: [] });
    }

    for (const session of sessions) {
      for (const br of session.blockReviews) {
        const entry = blockMap.get(br.blockId);
        if (entry) {
          entry.totalReviews++;
          if (br.approved) entry.approvedCount++;
          if (br.suggestion) entry.suggestions.push(br.suggestion);
        }
      }
    }

    prompt = buildPillarPrompt({ pillarName: pillar.name, sessionCount: sessions.length, blocks: Array.from(blockMap.values()) });

  } else {
    // page: scopeId = "pillarSlug:pageSlug"
    const [pillarSlug, pageSlug] = scopeId.split(":");
    const pillar = getPillar(pillarSlug);
    const page = getPage(pillarSlug, pageSlug);
    if (!page || !pillar) throw new Error("Page not found");

    const sessions = await prisma.contentSession.findMany({
      where: { pillarSlug, status: "COMPLETED" },
      include: { blockReviews: { where: { blockId: { in: page.blocks.map((b) => b.id) } } } },
    });
    const sessionsWithData = sessions.filter((s) => s.blockReviews.length > 0);

    const blockMap = new Map<string, { label: string; section: string; currentText: string; totalReviews: number; approvedCount: number; suggestions: string[] }>();
    for (const block of page.blocks) {
      blockMap.set(block.id, { label: block.label, section: block.section, currentText: block.currentText, totalReviews: 0, approvedCount: 0, suggestions: [] });
    }
    for (const session of sessionsWithData) {
      for (const br of session.blockReviews) {
        const entry = blockMap.get(br.blockId);
        if (entry) {
          entry.totalReviews++;
          if (br.approved) entry.approvedCount++;
          if (br.suggestion) entry.suggestions.push(br.suggestion);
        }
      }
    }

    prompt = buildPagePrompt({ pageTitle: page.title, pageUrl: page.url, pillarName: pillar.name, sessionCount: sessionsWithData.length, blocks: Array.from(blockMap.values()) });
  }

  const client = getClient();
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 700,
  });

  const content = response.choices[0]?.message?.content ?? "(brak odpowiedzi)";

  await prisma.aiSummary.upsert({
    where: { scope_scopeId: { scope, scopeId } },
    update: { content, generatedAt: new Date(), model: "gpt-4.1-mini" },
    create: { scope, scopeId, content, model: "gpt-4.1-mini" },
  });

  return content;
}
