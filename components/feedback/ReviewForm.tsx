"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ScoreField } from "@/components/feedback/ScoreField";
import { FeedbackTypeSelector } from "@/components/feedback/FeedbackTypeSelector";
import { SeveritySelect } from "@/components/feedback/SeveritySelect";
import { useAutosave } from "@/hooks/useAutosave";
import { useReviewStore, type ReviewDraft } from "@/stores/review-store";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const formSchema = z.object({
  clarityScore: z.number().min(1).max(5),
  businessScore: z.number().min(1).max(5),
  trustScore: z.number().min(1).max(5),
  designScore: z.number().min(1).max(5),
  ctaScore: z.number().min(1).max(5),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  feedbackTypes: z.array(z.string()).min(1, "Wybierz co najmniej jeden obszar"),
  problem: z.string().min(10, "Opisz problem (min. 10 znaków)").max(2000),
  impact: z.string().min(10, "Opisz wpływ (min. 10 znaków)").max(2000),
  suggestion: z.string().min(10, "Dodaj rekomendację (min. 10 znaków)").max(2000),
  notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReviewFormProps {
  sectionId: string;
  sectionName: string;
  sessionId: string;
  pillarSlug: string;
  nextSectionSlug: string | null;
  draft: ReviewDraft | null;
  onSavingChange?: (saving: boolean) => void;
}

// ---------------------------------------------------------------------------
// Editorial field wrapper
// ---------------------------------------------------------------------------

function EditorialField({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: optional ? "#A6A6A6" : "#242F44",
          letterSpacing: "0.01em",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
        }}
      >
        {label}
        {optional && (
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>(opcjonalnie)</span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: "0.75rem", color: "#B91C1C" }}>{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReviewForm({
  sectionId,
  sectionName,
  sessionId,
  pillarSlug,
  nextSectionSlug,
  draft,
  onSavingChange,
}: ReviewFormProps) {
  const router = useRouter();
  const markSectionComplete = useReviewStore((s) => s.markSectionComplete);
  const { save } = useAutosave(sectionId, sessionId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clarityScore: draft?.clarityScore,
      businessScore: draft?.businessScore,
      trustScore: draft?.trustScore,
      designScore: draft?.designScore,
      ctaScore: draft?.ctaScore,
      severity: (draft?.severity as FormValues["severity"]) ?? undefined,
      feedbackTypes: draft?.feedbackTypes ?? [],
      problem: draft?.problem ?? "",
      impact: draft?.impact ?? "",
      suggestion: draft?.suggestion ?? "",
      notes: draft?.notes ?? "",
    },
  });

  const { formState: { errors, isSubmitting }, setValue, watch } = form;
  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    const { clarityScore, businessScore, trustScore, designScore, ctaScore, ...rest } = formValues;
    if (clarityScore || businessScore || trustScore || designScore || ctaScore) {
      save({ clarityScore, businessScore, trustScore, designScore, ctaScore, ...rest } as Record<string, unknown>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formValues)]);

  const onSubmit = async (values: FormValues) => {
    onSavingChange?.(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, sectionId, ...values }),
      });
      if (!res.ok) throw new Error();

      markSectionComplete(pillarSlug, sectionId);
      toast.success(`Ocena sekcji „${sectionName}" zapisana.`);

      if (nextSectionSlug) {
        router.push(`/filar/${pillarSlug}/${nextSectionSlug}`);
      } else {
        router.push(`/podsumowanie?sessionId=${sessionId}`);
      }
    } catch {
      toast.error("Nie udało się zapisać oceny. Spróbuj ponownie.");
    } finally {
      onSavingChange?.(false);
    }
  };

  const scoreFields = [
    { key: "clarityScore" as const, label: "Jasność komunikacji", description: "Czy przekaz jest natychmiastowo czytelny dla odbiorcy?" },
    { key: "businessScore" as const, label: "Czy sekcja pokazuje wartość dla klienta?", description: "Czy odbiorca rozumie, dlaczego ta usługa jest wartościowa?" },
    { key: "trustScore" as const, label: "Wiarygodność", description: "Czy sekcja buduje zaufanie i wiarygodność marki?" },
    { key: "designScore" as const, label: "Jakość designu", description: "Czy design jest profesjonalny, spójny i czytelny?" },
    { key: "ctaScore" as const, label: "Czy sekcja zachęca do kontaktu lub dalszego działania?", description: "Czy użytkownik wie, co powinien zrobić dalej?" },
  ];

  const divider = (
    <div style={{ borderTop: "1px solid #DDE3EE", margin: "0" }} />
  );

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* 01 - Scores */}
      <section style={{ padding: "2rem 0" }}>
        <p className="label-procedural" style={{ marginBottom: "1.75rem" }}>
          01 - Jak oceniasz tę sekcję?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {scoreFields.map((field) => (
            <ScoreField
              key={field.key}
              label={field.label}
              description={field.description}
              value={watch(field.key)}
              onChange={(v) => setValue(field.key, v, { shouldValidate: true })}
              error={errors[field.key]?.message}
            />
          ))}
        </div>
      </section>

      {divider}

      {/* 02 - Category */}
      <section style={{ padding: "2rem 0" }}>
        <p className="label-procedural" style={{ marginBottom: "1.75rem" }}>
          02 - Charakter uwagi
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <FeedbackTypeSelector
            value={watch("feedbackTypes") ?? []}
            onChange={(v) => setValue("feedbackTypes", v, { shouldValidate: true })}
            error={errors.feedbackTypes?.message}
          />
          <SeveritySelect
            value={watch("severity")}
            onChange={(v) => setValue("severity", v, { shouldValidate: true })}
            error={errors.severity?.message}
          />
        </div>
      </section>

      {divider}

      {/* 03 - Written assessment */}
      <section style={{ padding: "2rem 0" }}>
        <p className="label-procedural" style={{ marginBottom: "1.75rem" }}>
          03 - Twoje uwagi
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
          <EditorialField label="Co jest niejasne lub problematyczne?" error={errors.problem?.message}>
            <textarea
              {...form.register("problem")}
              placeholder="Opisz, co może być niezrozumiałe, mylące lub nieprzekonujące."
              rows={4}
              className={`editorial-textarea${errors.problem ? " has-error" : ""}`}
            />
          </EditorialField>

          <EditorialField label="Dlaczego to może przeszkadzać odbiorcy?" error={errors.impact?.message}>
            <textarea
              {...form.register("impact")}
              placeholder="Wyjaśnij, jak ten problem może wpływać na odbiór strony lub decyzję użytkownika."
              rows={4}
              className={`editorial-textarea${errors.impact ? " has-error" : ""}`}
            />
          </EditorialField>

          <EditorialField label="Jak można to poprawić?" error={errors.suggestion?.message}>
            <textarea
              {...form.register("suggestion")}
              placeholder="Zaproponuj zmianę lub kierunek poprawy."
              rows={4}
              className={`editorial-textarea${errors.suggestion ? " has-error" : ""}`}
            />
          </EditorialField>

          <EditorialField label="Uwagi dodatkowe" optional>
            <textarea
              {...form.register("notes")}
              placeholder="Inne obserwacje, kontekst, przykłady..."
              rows={3}
              className="editorial-textarea"
            />
          </EditorialField>
        </div>
      </section>

      {divider}

      {/* Submit */}
      <div
        style={{
          padding: "1.5rem 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span className="label-procedural">
          Odpowiedzi zapisują się automatycznie
        </span>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.625rem 1.75rem",
            backgroundColor: isSubmitting ? "#767171" : "#242F44",
            color: "#FFFFFF",
            fontSize: "0.8125rem",
            fontWeight: 500,
            letterSpacing: "0.025em",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "background-color 200ms ease",
            outline: "none",
          }}
        >
          {isSubmitting
            ? "Zapisywanie..."
            : nextSectionSlug
            ? "Przejdź dalej →"
            : "Przejdź do podsumowania →"}
        </button>
      </div>
    </form>
  );
}

