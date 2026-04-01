"use client";

import { useEffect, useState, useCallback } from "react";
import type { Locale, SurveyAnswers } from "@/types";
import { DEFAULT_LOCALE, getSavedLang, t } from "@/lib/i18n";
import ProgressSteps from "@/components/tracker/ProgressSteps";

const STORAGE_KEY = "asaka_survey";
const SESSION_KEY = "asaka_session_id";

export default function TrackerPage() {
  const [sessionId, setSessionId] = useState("");
  const [lang, setLang] = useState<Locale>(DEFAULT_LOCALE);
  const [districtId, setDistrictId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("sessionId") || localStorage.getItem(SESSION_KEY) || "";
    if (!sid) { setLoading(false); return; }

    setSessionId(sid);
    localStorage.setItem(SESSION_KEY, sid);

    // Load lang and district from answers
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const answers: SurveyAnswers = parsed.answers ?? parsed;
        setLang((answers.lang as Locale) || getSavedLang());
        setDistrictId((answers.district as string) || "");
      } else {
        setLang(getSavedLang());
      }
    } catch {
      setLang(getSavedLang());
    }

    // Load selected business from localStorage (saved by results page)
    const savedBiz = localStorage.getItem("asaka_selected_business");
    if (savedBiz) setBusinessTypeId(savedBiz);

    fetch(`/api/progress?sessionId=${sid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.steps) {
          setCompletedSteps(new Set(data.steps.map((s: { step: string }) => s.step)));
        }
      })
      .catch((err) => console.error("Failed to load progress:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleStepComplete = useCallback((stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!sessionId) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">{"\uD83D\uDCCB"}</div>
          <h1 className="text-xl font-bold mb-2">
            {t(lang, "Faol sessiya yo'q", "Нет активной сессии", "No active session")}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {t(lang,
              "Avval so'rovnomani to'ldiring, tavsiyalar oling va progressni kuzating.",
              "Сначала пройдите опрос, чтобы получить рекомендации и отслеживать прогресс.",
              "Complete the survey first to get recommendations and track your progress."
            )}
          </p>
          <a href="/" className="inline-block px-6 py-3 rounded-xl font-medium text-white" style={{ backgroundColor: "#1EBBD7" }}>
            {t(lang, "So'rovnomani boshlash", "Пройти опрос", "Start survey")}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1">
        {t(lang, "Sizning progressingiz", "Ваш прогресс", "Your progress")}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {t(lang, "Bajarilgan qadamlarni belgilang", "Отмечайте шаги по мере выполнения", "Check off steps as you complete them")}
      </p>

      <ProgressSteps
        lang={lang}
        sessionId={sessionId}
        districtId={districtId}
        businessTypeId={businessTypeId}
        completedSteps={completedSteps}
        onStepComplete={handleStepComplete}
      />

      <div className="mt-8 text-center">
        <a href={`/results?sessionId=${sessionId}`} className="text-sm text-primary hover:underline">
          {t(lang, "Tavsiyalarga qaytish", "Вернуться к рекомендациям", "Back to recommendations")}
        </a>
      </div>
    </main>
  );
}
