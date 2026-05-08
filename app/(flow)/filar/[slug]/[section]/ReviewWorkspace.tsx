"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useReviewStore } from "@/stores/review-store";
import { useHydrated } from "@/hooks/useHydrated";
import { ReviewHeader } from "@/components/review/ReviewHeader";
import { SectionPreview } from "@/components/shared/SectionPreview";
import { ReviewForm } from "@/components/feedback/ReviewForm";

interface Section {
  id: string;
  slug: string;
  name: string;
  order: number;
}

interface Props {
  pillarSlug: string;
  pillarName: string;
  section: Section;
  nextSectionSlug: string | null;
  totalSections: number;
  currentIndex: number;
}

export function ReviewWorkspace({
  pillarSlug,
  pillarName,
  section,
  nextSectionSlug,
  totalSections,
  currentIndex,
}: Props) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { sessionId, pillarSlug: storedPillarSlug, getDraft } = useReviewStore();
  const [ready, setReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!sessionId || storedPillarSlug !== pillarSlug) {
      router.replace(`/filar/${pillarSlug}`);
      return;
    }
    setReady(true);
  }, [hydrated, sessionId, storedPillarSlug, pillarSlug, router]);

  if (!hydrated || !ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <Loader2 style={{ width: "16px", height: "16px", color: "#CAD2E3", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const draft = getDraft(section.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Procedural header */}
      <ReviewHeader
        pillarName={pillarName}
        pillarSlug={pillarSlug}
        currentSection={currentIndex + 1}
        totalSections={totalSections}
        isSaving={isSaving}
      />

      {/* Split workspace */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left - Section brief */}
        <div
          style={{
            width: "42%",
            minWidth: "320px",
            maxWidth: "480px",
            flexShrink: 0,
            overflowY: "auto",
            backgroundColor: "#F8FAFC",
            borderRight: "1px solid #DDE3EE",
            padding: "3rem 2.5rem",
          }}
          className="max-lg:hidden"
        >
          <SectionPreview sectionSlug={section.slug} pillarName={pillarName} />
        </div>

        {/* Right - Review form */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            style={{
              maxWidth: "580px",
              margin: "0 auto",
              padding: "0 2.5rem 5rem",
            }}
          >
            {/* Section header */}
            <div
              style={{
                paddingTop: "3rem",
                paddingBottom: "2rem",
                borderBottom: "1px solid #DDE3EE",
                marginBottom: "0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  marginBottom: "0.5rem",
                }}
              >
                <Link
                  href={`/filar/${pillarSlug}`}
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#CAD2E3",
                    textDecoration: "none",
                    transition: "color 150ms",
                  }}
                  className="hover:text-corp-blue"
                >
                  ← Powrót do sekcji
                </Link>
              </div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 300,
                  color: "#242F44",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.2,
                }}
              >
                {section.name}
              </h1>
            </div>

            {/* Mobile: Section brief inline */}
            <div
              className="lg:hidden"
              style={{
                padding: "2rem 0",
                borderBottom: "1px solid #DDE3EE",
              }}
            >
              <SectionPreview sectionSlug={section.slug} pillarName={pillarName} />
            </div>

            {/* Form */}
            <ReviewForm
              sectionId={section.id}
              sectionName={section.name}
              sessionId={sessionId!}
              pillarSlug={pillarSlug}
              nextSectionSlug={nextSectionSlug}
              draft={draft}
              onSavingChange={setIsSaving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
