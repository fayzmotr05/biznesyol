"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Locale, SurveyAnswers, UserProfile, Question } from "@/types";
import { DEFAULT_LOCALE, getSavedLang, t } from "@/lib/i18n";

// Free text input component
function FreeTextInput({ question, lang, onSubmit }: { question: Question; lang: Locale; onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  const qText = lang === "uz" ? question.text_uz : lang === "en" ? question.text_en : question.text_ru;
  return (
    <div className="question-enter w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-2 text-center">{qText}</h2>
      <p className="text-sm text-muted text-center mb-6">
        {t(lang,
          "Masalan: \"Shaharlar aro odamlarni tashimoqchiman\" yoki \"Maktab yonida somsa pishirmoqchiman\"",
          "Например: \"Хочу перевозить людей между городами\" или \"Хочу печь самсу у школы\"",
          "For example: \"I want to transport people between cities\" or \"I want to bake samsa near the school\""
        )}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={t(lang, "O'z so'zlaringiz bilan yozing...", "Напишите своими словами...", "Write in your own words...")}
        className="w-full p-4 rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-base resize-none transition-all"
        autoFocus
      />
      <button
        onClick={() => text.trim() && onSubmit(text.trim())}
        disabled={text.trim().length < 3}
        className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-40 transition-all"
      >
        {t(lang, "Davom etish", "Продолжить", "Continue")}
      </button>
    </div>
  );
}

// Number input component for exact capital
function NumberInput({ question, lang, onSubmit }: { question: Question; lang: Locale; onSubmit: (val: string) => void }) {
  const [value, setValue] = useState("");
  const qText = lang === "uz" ? question.text_uz : lang === "en" ? question.text_en : question.text_ru;
  return (
    <div className="question-enter w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center">{qText}</h2>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          min="0"
          step="0.5"
          className="w-full p-4 rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-2xl text-center font-bold transition-all"
          autoFocus
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">
          {t(lang, "mln so'm", "млн сум", "mln UZS")}
        </span>
      </div>
      <p className="text-xs text-muted text-center mt-2">
        {t(lang,
          "Masalan: 7.5 = 7 million 500 ming so'm",
          "Например: 7.5 = 7 миллионов 500 тысяч сум",
          "Example: 7.5 = 7 million 500 thousand UZS"
        )}
      </p>
      <button
        onClick={() => value && parseFloat(value) >= 0 && onSubmit(value)}
        disabled={!value || parseFloat(value) < 0}
        className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-40 transition-all"
      >
        {t(lang, "Davom etish", "Продолжить", "Continue")}
      </button>
    </div>
  );
}
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

      // Auto-infer skills when user picks a sphere
      if (currentId === "sphere" && typeof value === "string") {
        const sphereSkills: Record<string, string[]> = {
          food: ["cooking", "baking"],
          beauty: ["hairdressing", "beauty"],
          sewing: ["sewing", "design"],
          trade: ["sales", "accounting_basic"],
          agro: ["farming", "agriculture"],
          repair: ["electronics", "car_repair", "construction"],
          transport: ["driving"],
          education: ["teaching", "subject_knowledge"],
          digital: ["programming", "web_design", "photography"],
          services: ["physical_work", "customer_service"],
        };
        nextAnswers.skills = sphereSkills[value] || [];
      }

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
      // Don't save to API yet — wait until survey submit when we have sessionId
      // Just store profile data in answers for scoring and later API call
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

        // NOW save user profile with sessionId
        if (finalAnswers.user_name) {
          try {
            await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: data.id,
                fullName: finalAnswers.user_name,
                phone: finalAnswers.user_phone,
                birthYear: finalAnswers.user_birth_year ? parseInt(finalAnswers.user_birth_year as string) : null,
                gender: finalAnswers.user_gender_actual,
                districtId: finalAnswers.district,
                education: finalAnswers.user_education,
                familySize: finalAnswers.user_family_size ? parseInt(finalAnswers.user_family_size as string) : null,
                monthlyIncomeMln: finalAnswers.user_income ? parseFloat(finalAnswers.user_income as string) : null,
                employmentStatus: finalAnswers.user_employment,
                hasBusinessExperience: finalAnswers.user_experience === "yes",
              }),
            });
          } catch (err) {
            console.error("Profile save failed:", err);
          }
        }

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
        ) : question.type === "free_text" ? (
          <FreeTextInput
            question={question}
            lang={lang}
            onSubmit={(text) => handleAnswer(text)}
          />
        ) : question.type === "number_input" ? (
          <NumberInput
            question={question}
            lang={lang}
            onSubmit={(num) => handleAnswer(num)}
          />
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
