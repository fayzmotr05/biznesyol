"use client";

import type { Locale } from "@/types";
import { t } from "@/lib/i18n";

interface PathSplitProps {
  lang: Locale;
  onSelect: (path: "job" | "business") => void;
}

const paths = [
  {
    value: "business" as const,
    emoji: "\uD83D\uDE80",
    title: { uz: "Biznes ochish", ru: "Открыть бизнес", en: "Start a business" },
    desc: {
      uz: "Eng yaxshi biznes turini, kredit uchun bankni tanlaymiz va bosqichma-bosqich reja tuzamiz.",
      ru: "Подберём лучший вид бизнеса, банк для кредита и составим пошаговый план действий.",
      en: "We'll find the best business type, match a bank loan, and build your step-by-step action plan.",
    },
  },
  {
    value: "job" as const,
    emoji: "\uD83D\uDCBC",
    title: { uz: "Ish topish", ru: "Найти работу", en: "Find a job" },
    desc: {
      uz: "Ko'nikmalaringiz va tumaningiz bo'yicha ish o'rinlarini tanlaymiz. Ish beruvchilar ro'yxati va kontaktlarini olasiz.",
      ru: "Подберём вакансии по вашим навыкам и району. Получите список работодателей и контакты.",
      en: "We'll match vacancies to your skills and district. You'll get a list of employers and contacts.",
    },
  },
];

export default function PathSplit({ lang, onSelect }: PathSplitProps) {
  return (
    <div className="question-enter w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center">
        {t(lang, "Maqsadingiz nima?", "Какая у вас цель?", "What is your goal?")}
      </h2>
      <div className="flex flex-col gap-4">
        {paths.map((p) => (
          <button
            key={p.value}
            onClick={() => onSelect(p.value)}
            className="w-full p-6 rounded-2xl border-2 border-gray-200 hover:border-primary text-left transition-all duration-200 active:scale-[0.98] hover:shadow-md"
          >
            <div className="text-3xl mb-2">{p.emoji}</div>
            <div className="text-lg font-semibold mb-1">{p.title[lang]}</div>
            <div className="text-sm text-gray-500 leading-relaxed">{p.desc[lang]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
