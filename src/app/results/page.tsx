"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale, BusinessPlanResult } from "@/types";
import { DEFAULT_LOCALE, t } from "@/lib/i18n";
import BusinessPlanDisplay from "@/components/results/BusinessPlanDisplay";

const STORAGE_KEY = "asaka_survey";

interface BusinessIdea {
  title: string;
  description: string;
  estimated_startup_mln: number | string;
  estimated_monthly_income_mln: number | string;
  why_suitable: string;
  key_requirement: string;
  suggested_loan?: string;
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("sessionId") ?? "";
  const [sessionId, setSessionId] = useState(urlSessionId);

  const [lang, setLang] = useState<Locale>(DEFAULT_LOCALE);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [ideasError, setIdeasError] = useState<string | null>(null);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [plan, setPlan] = useState<BusinessPlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Resolve sessionId and lang
  useEffect(() => {
    let sid = urlSessionId;
    if (!sid) {
      sid = localStorage.getItem("asaka_session_id") || "";
      if (sid) setSessionId(sid);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const answers = parsed.answers ?? parsed;
        if (answers.lang) setLang(answers.lang as Locale);
      }
    } catch {}

    if (sid) fetchIdeas(sid);
    else setIdeasLoading(false);
  }, [urlSessionId]);

  async function fetchIdeas(sid: string) {
    setIdeasLoading(true);
    setIdeasError(null);
    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIdeasError(data.error || "Server xatosi");
        return;
      }
      setIdeas(data.ideas || []);
    } catch {
      setIdeasError(
        t(
          lang,
          "G'oyalarni yuklashda xatolik yuz berdi",
          "Ошибка загрузки идей",
          "Error loading ideas"
        )
      );
    } finally {
      setIdeasLoading(false);
    }
  }

  const handleSelect = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      setPlan(null);
      setPlanLoading(false);
      setPlanError(null);
    },
    []
  );

  const generatePlan = useCallback(async () => {
    if (selectedIdx === null || planLoading) return;
    if (!sessionId) {
      setPlanError(
        t(
          lang,
          "Sessiya topilmadi. So'rovnomani qayta to'ldiring.",
          "Сессия не найдена. Пройдите опрос заново.",
          "Session not found. Please retake the survey."
        )
      );
      return;
    }
    setPlanLoading(true);
    setPlan(null);
    setPlanError(null);

    const idea = ideas[selectedIdx];

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          idea: {
            title: idea.title,
            description: idea.description,
            estimated_startup_mln: idea.estimated_startup_mln,
            estimated_monthly_income_mln: idea.estimated_monthly_income_mln,
            why_suitable: idea.why_suitable,
            key_requirement: idea.key_requirement,
            suggested_loan: idea.suggested_loan,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPlanError(data.error || "Server xatosi");
        setPlanLoading(false);
        return;
      }

      setPlan(data as BusinessPlanResult);
    } catch {
      setPlanError(
        t(
          lang,
          "Xatolik yuz berdi. Qayta urinib ko'ring.",
          "Произошла ошибка. Попробуйте ещё раз.",
          "An error occurred. Please try again."
        )
      );
    } finally {
      setPlanLoading(false);
    }
  }, [selectedIdx, ideas, sessionId, planLoading, lang]);

  // No session
  if (!sessionId && !ideasLoading) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-2">
            {t(
              lang,
              "Natijalar topilmadi",
              "Результаты не найдены",
              "No results found"
            )}
          </h1>
          <p className="text-sm text-muted mb-6">
            {t(
              lang,
              "Avval so'rovnomani to'ldiring",
              "Сначала пройдите опрос",
              "Please complete the survey first"
            )}
          </p>
          <Link
            href="/survey"
            className="inline-block px-6 py-3 rounded-xl font-medium text-white bg-primary"
          >
            {t(
              lang,
              "So'rovnomani boshlash",
              "Начать опрос",
              "Start survey"
            )}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t(
            lang,
            "Sizga mos biznes g'oyalar",
            "Бизнес-идеи для вас",
            "Business ideas for you"
          )}
        </h1>
        <p className="text-sm text-muted mt-1">
          {t(
            lang,
            "AI sizning ma'lumotlaringiz asosida tavsiyalar tayyorladi",
            "AI подготовил рекомендации на основе ваших данных",
            "AI prepared recommendations based on your data"
          )}
        </p>
      </div>

      {/* Loading ideas */}
      {ideasLoading && (
        <div className="py-12 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">
            {t(
              lang,
              "AI biznes g'oyalarni tayyorlamoqda...",
              "AI подбирает бизнес-идеи...",
              "AI is preparing business ideas..."
            )}
          </h3>
          <p className="text-sm text-muted">
            {t(
              lang,
              "Bu 10-15 soniya vaqt oladi",
              "Это займёт 10-15 секунд",
              "This takes 10-15 seconds"
            )}
          </p>
        </div>
      )}

      {/* Ideas error */}
      {ideasError && (
        <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700 mb-4">
          {ideasError}
          <button
            onClick={() => sessionId && fetchIdeas(sessionId)}
            className="ml-2 underline font-medium"
          >
            {t(lang, "Qayta urinish", "Повторить", "Retry")}
          </button>
        </div>
      )}

      {/* Ideas list */}
      {!ideasLoading && ideas.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            {t(
              lang,
              "G'oyani tanlang — AI sizga batafsil reja tuzadi",
              "Выберите идею — AI составит подробный план",
              "Choose an idea — AI will create a detailed plan"
            )}
          </h2>
          <div className="space-y-3">
            {ideas.map((idea, i) => {
              const isSelected = selectedIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="font-semibold text-base mb-1">
                    {idea.title}
                  </div>
                  <p className="text-sm text-muted mb-2">{idea.description}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-primary font-medium">
                      {t(lang, "Boshlash:", "Старт:", "Start:")}{" "}
                      ~{idea.estimated_startup_mln} mln
                    </span>
                    <span className="text-accent font-medium">
                      {t(lang, "Foyda:", "Прибыль:", "Profit:")}{" "}
                      ~{idea.estimated_monthly_income_mln} mln/oy
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-primary/10 space-y-1">
                      {idea.why_suitable && (
                        <p className="text-xs text-primary/80">
                          {idea.why_suitable}
                        </p>
                      )}
                      {idea.suggested_loan && (
                        <p className="text-xs text-blue-600 font-medium">
                          Kredit: {idea.suggested_loan}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Generate plan button */}
      {selectedIdx !== null && !plan && !planLoading && !planError && (
        <section className="mb-6">
          <button
            onClick={generatePlan}
            className="w-full py-4 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 bg-primary"
          >
            {t(
              lang,
              "Batafsil biznes-reja yaratish",
              "Создать подробный бизнес-план",
              "Generate detailed business plan"
            )}
          </button>
        </section>
      )}

      {/* Plan error */}
      {planError && (
        <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700 mb-4">
          {planError}
          <button
            onClick={() => {
              setPlanError(null);
              generatePlan();
            }}
            className="ml-2 underline"
          >
            {t(lang, "Qayta urinish", "Повторить", "Retry")}
          </button>
        </div>
      )}

      {/* Business plan display */}
      <BusinessPlanDisplay planJson={plan} isLoading={planLoading} lang={lang} />

      {/* Actions */}
      {(plan || ideas.length > 0) && (
        <section className="mt-6 mb-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl border-2 border-border font-medium text-foreground hover:border-primary transition-colors"
          >
            {t(lang, "Chop etish", "Печать", "Print")}
          </button>
          <button
            onClick={() => {
              const msg = t(
                lang,
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
            className="flex-1 py-3 rounded-xl border-2 border-border font-medium text-foreground hover:border-primary transition-colors"
          >
            {t(lang, "Qaytadan boshlash", "Начать заново", "Start over")}
          </button>
        </section>
      )}

      {/* Tracker link */}
      {sessionId && plan && (
        <div className="mb-6 text-center">
          <Link
            href={`/tracker?sessionId=${sessionId}`}
            className="text-sm text-primary hover:underline"
          >
            {t(
              lang,
              "Progressni kuzatish",
              "Отслеживать прогресс",
              "Track your progress"
            )}{" "}
            →
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted/60 text-center leading-relaxed pb-6">
        {t(
          lang,
          "Tavsiyalar taxminiy xarakterga ega. Qaror qabul qilishdan oldin o'z sohangizdagi tadbirkorlar bilan maslahatlashing.",
          "Рекомендации носят ориентировочный характер. Перед принятием решений проконсультируйтесь с предпринимателями из вашей сферы.",
          "Recommendations are approximate. Consult with entrepreneurs in your field before making decisions."
        )}
      </p>
    </main>
  );
}
