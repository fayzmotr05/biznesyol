"use client";

import { useState } from "react";
import type { ScoredBusiness, Locale } from "@/types";
import { t, localized } from "@/lib/i18n";

interface BusinessCardProps {
  business: ScoredBusiness;
  rank: number;
  lang: Locale;
  onSelect: () => void;
  isSelected: boolean;
}

const CRITERIA = {
  skills_match: { uz: "Ko'nikmalar", ru: "Навыки", en: "Skills" },
  capital_sufficient: { uz: "Kapital", ru: "Капитал", en: "Capital" },
  competition_low: { uz: "Raqobat", ru: "Конкуренция", en: "Competition" },
  risk_acceptable: { uz: "Xavf", ru: "Риск", en: "Risk" },
  season_fit: { uz: "Mavsum", ru: "Сезон", en: "Season" },
} as const;

export default function BusinessCard({ business, rank, lang, onSelect, isSelected }: BusinessCardProps) {
  const [expanded, setExpanded] = useState(false);
  const biz = business.business_type;
  const name = localized(biz as unknown as Record<string, unknown>, "name", lang);
  const desc = localized(biz as unknown as Record<string, unknown>, "description", lang);
  const scorePct = Math.round(business.total_score * 100);

  function handleClick() {
    if (!isSelected) onSelect();
    setExpanded(!expanded);
  }

  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
      isSelected ? "border-primary shadow-md" : "border-gray-200 hover:border-primary/40"
    }`}>
      <button onClick={handleClick} className="w-full p-5 text-left flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ backgroundColor: rank === 1 ? "#3BB741" : rank === 2 ? "#1EBBD7" : "#94a3b8" }}
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg leading-tight">{name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{desc}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-primary">{scorePct}%</div>
          <div className="text-xs text-gray-400">
            {t(lang, "moslik", "совпадение", "match")}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 question-enter">
          <div className="space-y-3 mb-5">
            {(Object.entries(business.breakdown) as [keyof typeof CRITERIA, number][]).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{CRITERIA[key][lang]}</span>
                  <span className="font-medium">{Math.round(value * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(value * 100)}%`,
                      backgroundColor: value >= 0.7 ? "#3BB741" : value >= 0.4 ? "#F59E0B" : "#EF4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold text-primary">{biz.min_capital_mln}–{biz.max_capital_mln}</div>
              <div className="text-xs text-gray-500">
                {t(lang, "mln so'm boshlash", "млн сум старт", "M UZS to start")}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold text-accent">~{biz.avg_monthly_revenue_mln - biz.avg_monthly_expense_mln}</div>
              <div className="text-xs text-gray-500">
                {t(lang, "mln/oy foyda", "млн/мес прибыль", "M/mo profit")}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold">~{biz.breakeven_months}</div>
              <div className="text-xs text-gray-500">
                {t(lang, "oy qoplash", "мес окупаемость", "mo breakeven")}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">
              {t(lang, "Birinchi qadamlar:", "Первые шаги:", "First steps:")}
            </h4>
            <ol className="space-y-1">
              {biz.checklist_steps.slice(0, 3).map((step) => {
                const stepText = lang === "uz" ? step.text_uz : lang === "en" ? (step.text_en || step.text_ru) : step.text_ru;
                return (
                  <li key={step.step} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-primary font-medium shrink-0">{step.step}.</span>
                    {stepText}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
