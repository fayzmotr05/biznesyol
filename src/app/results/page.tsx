"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale, SurveyAnswers, ScoredBusiness, BusinessPlanResult, District } from "@/types";
import { DEFAULT_LOCALE, t } from "@/lib/i18n";
import { scoreBusinessTypes } from "@/lib/scoring";
import districtsData from "../../../data/districts.json";
import BusinessCard from "@/components/results/BusinessCard";
import Checklist from "@/components/results/Checklist";
import BusinessPlanDisplay from "@/components/results/BusinessPlanDisplay";

const districts = districtsData as District[];
const STORAGE_KEY = "asaka_survey";

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  // Try URL param first, then localStorage
  const urlSessionId = searchParams.get("sessionId") ?? "";
  const [sessionId, setSessionId] = useState(urlSessionId);

  const [answers, setAnswers] = useState<SurveyAnswers | null>(null);
  const [district, setDistrict] = useState<District | null>(null);
  const [scored, setScored] = useState<ScoredBusiness[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [plan, setPlan] = useState<BusinessPlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);

  const lang: Locale = (answers?.lang as Locale) || DEFAULT_LOCALE;

  // Load answers and compute scores
  useEffect(() => {
    // Resolve sessionId: URL param > localStorage
    if (!sessionId) {
      const saved = localStorage.getItem("asaka_session_id");
      if (saved) setSessionId(saved);
    }

    let stored: SurveyAnswers | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        stored = parsed.answers ?? parsed;
      }
    } catch {}

    if (!stored || !stored.district) {
      setNoData(true);
      return;
    }

    setAnswers(stored);
    const dist = districts.find((d) => d.id === stored!.district);
    if (!dist) { setNoData(true); return; }

    setDistrict(dist);
    setScored(scoreBusinessTypes(stored, dist.type));
  }, [sessionId]);

  // Select a business → compute banks, save selection
  const handleSelect = useCallback((idx: number) => {
    setSelectedIdx(idx);
    setPlan(null);
    setPlanLoading(false);
    setPlanError(null);

    const bizId = scored[idx].business_type_id;

    // Save selected business for tracker
    localStorage.setItem("asaka_selected_business", bizId);
  }, [answers, district, scored]);

  // Generate AI plan with safe JSON extraction
  const generatePlan = useCallback(async () => {
    if (selectedIdx === null || planLoading) return;
    if (!sessionId) {
      setPlanError(t(lang, "Sessiya topilmadi. So'rovnomani qayta to'ldiring.", "Сессия не найдена. Пройдите опрос заново.", "Session not found. Please retake the survey."));
      return;
    }
    setPlanLoading(true);
    setPlan(null);
    setPlanError(null);

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          businessId: scored[selectedIdx].business_type_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPlanError(data.error || "Server error");
        setPlanLoading(false);
        return;
      }

      setPlan(data as BusinessPlanResult);
    } catch (err) {
      console.error("Plan generation failed:", err);
      setPlanError(t(lang, "Xatolik yuz berdi. Qayta urinib ko'ring.", "Произошла ошибка. Попробуйте ещё раз.", "An error occurred. Please try again."));
    } finally {
      setPlanLoading(false);
    }
  }, [selectedIdx, scored, sessionId, planLoading, lang]);

  // No data state
  if (noData) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">{"\uD83D\uDCCA"}</div>
          <h1 className="text-xl font-bold mb-2">
            {t(lang, "Natijalar topilmadi", "Результаты не найдены", "No results found")}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {t(lang,
              "Avval so'rovnomani to'ldiring",
              "Сначала пройдите опрос",
              "Please complete the survey first"
            )}
          </p>
          <Link
            href="/survey"
            className="inline-block px-6 py-3 rounded-xl font-medium text-white"
            style={{ backgroundColor: "#1EBBD7" }}
          >
            {t(lang, "So'rovnomani boshlash", "Начать опрос", "Start survey")}
          </Link>
        </div>
      </main>
    );
  }

  // Loading state
  if (!answers || scored.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {t(lang, "Natijalar yuklanmoqda...", "Загрузка результатов...", "Loading results...")}
          </p>
        </div>
      </main>
    );
  }

  const selectedBiz = selectedIdx !== null ? scored[selectedIdx] : null;

  return (
    <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t(lang, "Sizning tavsiyalaringiz", "Ваши рекомендации", "Your recommendations")}
        </h1>
        {district && (
          <p className="text-sm text-gray-500 mt-1">
            {locName(district, lang)}, {locRegion(district, lang)}
          </p>
        )}
      </div>

      {/* Business type selection — simple cards, no fake scores */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          {t(lang,
            "Biznes turini tanlang — AI sizga reja tuzib beradi",
            "Выберите тип бизнеса — AI составит план",
            "Choose a business type — AI will create your plan"
          )}
        </h2>
        <div className="space-y-2">
          {scored.map((biz, i) => {
            const isSelected = selectedIdx === i;
            const name = lang === "uz" ? biz.business_type.name_uz : biz.business_type.name_ru;
            return (
              <button
                key={biz.business_type_id}
                onClick={() => { handleSelect(i); }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="font-semibold">{name}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* AI Business Plan — auto-generates when business selected */}
      {selectedBiz && (
        <section className="mb-8">
          {!plan && !planLoading && !planError && (
            <button
              onClick={generatePlan}
              className="w-full py-4 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90"
              style={{ backgroundColor: "#0066FF" }}
            >
              {t(lang, "Biznes-reja yaratish", "Создать бизнес-план", "Generate business plan")}
            </button>
          )}
          {planError && (
            <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700">
              {planError}
              <button
                onClick={() => { setPlanError(null); generatePlan(); }}
                className="ml-2 underline"
              >
                {t(lang, "Qayta urinish", "Повторить", "Retry")}
              </button>
            </div>
          )}
          <BusinessPlanDisplay planJson={plan} isLoading={planLoading} lang={lang} />
        </section>
      )}

      {/* Actions */}
      <section className="mb-6 flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 hover:border-primary transition-colors"
        >
          {t(lang, "Chop etish", "Печать", "Print")}
        </button>
        <button
          onClick={() => {
            const msg = t(lang,
              "Rostdan ham qaytadan boshlaysizmi? Barcha natijalar o'chiriladi.",
              "Вы уверены? Все результаты будут удалены.",
              "Are you sure? All results will be cleared."
            );
            if (window.confirm(msg)) {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem("asaka_session_id");
              localStorage.removeItem("asaka_selected_business");
              window.location.href = "/";
            }
          }}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 hover:border-primary transition-colors"
        >
          {t(lang, "Qaytadan boshlash", "Начать заново", "Start over")}
        </button>
      </section>

      {/* Tracker link */}
      {sessionId && (
        <div className="mb-6 text-center">
          <Link href={`/tracker?sessionId=${sessionId}`} className="text-sm text-primary hover:underline">
            {t(lang, "Progressni kuzatish", "Отслеживать прогресс", "Track your progress")} →
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center leading-relaxed pb-6">
        {t(lang,
          "Tavsiyalar taxminiy xarakterga ega. Qaror qabul qilishdan oldin o'z sohangizdagi tadbirkorlar bilan maslahatlashing.",
          "Рекомендации носят ориентировочный характер. Перед принятием решений проконсультируйтесь с предпринимателями из вашей сферы.",
          "Recommendations are approximate. Consult with entrepreneurs in your field before making decisions."
        )}
      </p>
    </main>
  );
}

function locName(d: District, lang: Locale): string {
  if (lang === "uz") return d.name_uz;
  return d.name_ru;
}

function locRegion(d: District, lang: Locale): string {
  if (lang === "uz") return d.region_uz;
  return d.region_ru;
}
