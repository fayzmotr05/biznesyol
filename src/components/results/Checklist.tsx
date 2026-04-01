"use client";

import { useState, useCallback } from "react";
import type { ChecklistStep, Locale } from "@/types";
import { t } from "@/lib/i18n";

interface ChecklistProps {
  steps: ChecklistStep[];
  lang: Locale;
  sessionId: string;
}

export default function Checklist({ steps, lang, sessionId }: ChecklistProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggle = useCallback(
    async (stepIndex: number) => {
      const next = new Set(completed);
      const wasCompleted = next.has(stepIndex);
      if (wasCompleted) { next.delete(stepIndex); } else { next.add(stepIndex); }
      setCompleted(next);

      if (!wasCompleted && sessionId) {
        try {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, step: `checklist_${stepIndex}` }),
          });
        } catch {}
      }
    },
    [completed, sessionId]
  );

  function stepText(step: ChecklistStep): string {
    if (lang === "uz") return step.text_uz || step.text_ru;
    if (lang === "en") return step.text_en || step.text_ru;
    return step.text_ru;
  }

  return (
    <div className="question-enter">
      <h4 className="font-semibold mb-3">
        {t(lang, "Bosqichma-bosqich reja", "Пошаговый план", "Step-by-step plan")}
      </h4>
      <div className="space-y-2">
        {steps.map((step) => {
          const isDone = completed.has(step.step);
          return (
            <div
              key={step.step}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isDone ? "bg-green-50" : "bg-gray-50"}`}
            >
              <button
                onClick={() => toggle(step.step)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isDone ? "bg-accent border-accent" : "border-gray-300 hover:border-primary"
                }`}
              >
                {isDone && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${isDone ? "line-through text-gray-400" : "text-gray-700"}`}>
                  <span className="text-primary font-medium mr-1">{step.step}.</span>
                  {stepText(step)}
                </p>
                {step.link && (
                  <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                    {step.link.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-sm text-gray-400 text-center">
        {completed.size}/{steps.length} {t(lang, "bajarildi", "выполнено", "completed")}
      </div>
    </div>
  );
}
