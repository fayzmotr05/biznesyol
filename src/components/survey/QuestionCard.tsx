"use client";

import { useState } from "react";
import type { Question, Locale } from "@/types";
import { t } from "@/lib/i18n";

interface QuestionCardProps {
  question: Question;
  lang: Locale;
  onAnswer: (value: string | string[]) => void;
  selected?: string | string[];
}

export default function QuestionCard({
  question,
  lang,
  onAnswer,
  selected,
}: QuestionCardProps) {
  const text =
    lang === "uz" ? question.text_uz : lang === "en" ? question.text_en : question.text_ru;
  const options = question.options ?? [];

  const [checked, setChecked] = useState<string[]>(
    Array.isArray(selected) ? selected : []
  );

  function handleSingle(value: string) {
    onAnswer(value);
  }

  function handleMultiToggle(value: string) {
    const next = checked.includes(value)
      ? checked.filter((v) => v !== value)
      : [...checked, value];
    setChecked(next);
  }

  function handleMultiSubmit() {
    if (checked.length > 0) onAnswer(checked);
  }

  function label(opt: { label_uz: string; label_ru: string; label_en: string }) {
    return lang === "uz" ? opt.label_uz : lang === "en" ? opt.label_en : opt.label_ru;
  }

  return (
    <div className="question-enter w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center leading-snug">
        {text}
      </h2>

      {question.type === "single_choice" && (
        <div className="flex flex-col gap-3">
          {options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSingle(opt.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                  isSelected
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-gray-200 hover:border-primary/40"
                }`}
              >
                {label(opt)}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "multi_choice" && (
        <>
          <div className="flex flex-col gap-3">
            {options.map((opt) => {
              const isChecked = checked.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleMultiToggle(opt.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 active:scale-[0.98] ${
                    isChecked
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked ? "bg-primary border-primary" : "border-gray-300"
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {label(opt)}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleMultiSubmit}
            disabled={checked.length === 0}
            className="mt-6 w-full py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: checked.length > 0 ? "#1EBBD7" : undefined }}
          >
            {t(lang,
              `Davom etish (${checked.length})`,
              `Продолжить (${checked.length})`,
              `Continue (${checked.length})`
            )}
          </button>
        </>
      )}
    </div>
  );
}
