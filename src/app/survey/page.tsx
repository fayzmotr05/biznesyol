"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale, SurveyAnswers, UserProfile } from "@/types";
import { DEFAULT_LOCALE, getSavedLang, t } from "@/lib/i18n";
import {
  getQuestion,
  getNextQuestionId,
  isComplete,
  getSurveyProgress,
  getCurrentQuestionId,
} from "@/lib/survey/engine";
import { FIRST_QUESTION_ID } from "@/lib/survey/questions";
import ProgressBar from "@/components/survey/ProgressBar";
import QuestionCard from "@/components/survey/QuestionCard";
import PathSplit from "@/components/survey/PathSplit";
import DistrictSelect from "@/components/survey/DistrictSelect";
import UserRegistration from "@/components/survey/UserRegistration";

const STORAGE_KEY = "asaka_survey";

function loadState(): { answers: SurveyAnswers; history: string[] } {
  if (typeof window === "undefined") return { answers: {}, history: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { answers: {}, history: [] };
}

function saveState(answers: SurveyAnswers, history: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, history }));
}

export default function SurveyPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [history, setHistory] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string>(FIRST_QUESTION_ID);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = loadState();
    if (Object.keys(saved.answers).length > 0) {
      setAnswers(saved.answers);
      setHistory(saved.history);
      const resumeId = getCurrentQuestionId(saved.answers);
      if (resumeId) {
        setCurrentId(resumeId);
      } else if (isComplete(saved.answers)) {
        router.push("/results");
        return;
      }
    }
    setHydrated(true);
  }, [router]);

  const lang: Locale = (answers.lang as Locale) || getSavedLang() || DEFAULT_LOCALE;

  const handleAnswer = useCallback(
    (value: string | string[]) => {
      const nextAnswers = { ...answers, [currentId]: value };
      const nextHistory = [...history, currentId];

      setAnswers(nextAnswers);
      setHistory(nextHistory);
      saveState(nextAnswers, nextHistory);

      if (isComplete(nextAnswers)) {
        submitAndRedirect(nextAnswers);
        return;
      }

      const nextId = getNextQuestionId(currentId, nextAnswers);
      if (nextId) setCurrentId(nextId);
    },
    [answers, currentId, history]
  );

  // Handle registration form completion
  const handleRegistration = useCallback(
    async (profile: UserProfile) => {
      // Save profile to API
      try {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: profile.full_name,
            phone: profile.phone,
            birthYear: profile.birth_year,
            gender: profile.gender,
            districtId: profile.district_id,
            education: profile.education,
            familySize: profile.family_size,
            monthlyIncomeMln: profile.monthly_income_mln,
            employmentStatus: profile.employment_status,
            hasBusinessExperience: profile.has_business_experience,
          }),
        });
      } catch (err) {
        console.error("Failed to save profile:", err);
      }

      // Store profile data in answers for scoring
      const nextAnswers: SurveyAnswers = {
        ...answers,
        register: "done",
        user_name: profile.full_name,
        user_phone: profile.phone,
        user_birth_year: String(profile.birth_year || ""),
        user_gender_actual: profile.gender || "",
        user_education: profile.education || "",
        user_income: String(profile.monthly_income_mln || ""),
        user_employment: profile.employment_status || "",
        user_experience: profile.has_business_experience ? "yes" : "no",
      };
      const nextHistory = [...history, currentId];

      setAnswers(nextAnswers);
      setHistory(nextHistory);
      saveState(nextAnswers, nextHistory);

      const nextId = getNextQuestionId(currentId, nextAnswers);
      if (nextId) setCurrentId(nextId);
    },
    [answers, currentId, history]
  );

  const handleBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setCurrentId(prev);
    setHistory(history.slice(0, -1));
    saveState(answers, history.slice(0, -1));
  }, [answers, history]);

  async function submitAndRedirect(finalAnswers: SurveyAnswers) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: finalAnswers.lang || DEFAULT_LOCALE,
          district_id: finalAnswers.district,
          path: finalAnswers.path,
          answers: finalAnswers,
        }),
      });
      const data = await res.json();
      if (data.id) {
        localStorage.setItem("asaka_session_id", data.id);
        router.push(`/results?sessionId=${data.id}`);
        return;
      }
    } catch (err) {
      console.error("Survey submit failed:", err);
    }
    setSubmitting(false);
    router.push("/results");
  }

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">
            {t(lang, "Natijalar tayyorlanmoqda...", "Подготовка результатов...", "Preparing results...")}
          </p>
        </div>
      </div>
    );
  }

  const question = getQuestion(currentId);
  const progress = getSurveyProgress(answers);

  return (
    <main className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
      <ProgressBar current={progress.current} total={progress.total} lang={lang} />

      {history.length > 0 && (
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors self-start"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t(lang, "Orqaga", "Назад", "Back")}
        </button>
      )}

      <div className="flex-1 flex items-center">
        {/* Registration step — special rendering */}
        {currentId === "register" ? (
          <UserRegistration
            lang={lang}
            districtId={(answers.district as string) || ""}
            onComplete={handleRegistration}
          />
        ) : question.type === "path_split" ? (
          <PathSplit lang={lang} onSelect={(path) => handleAnswer(path)} />
        ) : question.type === "district_select" ? (
          <DistrictSelect lang={lang} onSelect={(id) => handleAnswer(id)} />
        ) : (
          <QuestionCard
            key={currentId}
            question={question}
            lang={lang}
            onAnswer={handleAnswer}
            selected={answers[currentId]}
          />
        )}
      </div>

      <p className="text-xs text-muted/50 text-center mt-6">
        {t(lang,
          "Ma'lumotlaringiz maxfiy saqlanadi",
          "Ваши данные конфиденциальны",
          "Your data is kept confidential"
        )}
      </p>
    </main>
  );
}
