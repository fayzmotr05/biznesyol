"use client";

import { useState, useCallback } from "react";
import type { Locale } from "@/types";
import { t } from "@/lib/i18n";

interface Step {
  id: string;
  text: { uz: string; ru: string; en: string };
  motivation: { uz: string; ru: string; en: string };
}

const STEPS: Step[] = [
  {
    id: "step_1",
    text: { uz: "Tavsiyalarni o'rgandim", ru: "Изучил рекомендации", en: "Reviewed recommendations" },
    motivation: {
      uz: "Ajoyib boshlang'ich! Bilim — muvaffaqiyatga birinchi qadam.",
      ru: "Отличное начало! Знание — первый шаг к успеху.",
      en: "Great start! Knowledge is the first step to success.",
    },
  },
  {
    id: "step_2",
    text: { uz: "YaTT ro'yxatdan o'tdim", ru: "Зарегистрировал ИП", en: "Registered as individual entrepreneur" },
    motivation: {
      uz: "Endi siz rasmiy tadbirkorsiz! Davom eting.",
      ru: "Вы теперь официальный предприниматель! Так держать.",
      en: "You're now an official entrepreneur! Keep going.",
    },
  },
  {
    id: "step_3",
    text: { uz: "Kredit uchun ariza topshirdim", ru: "Подал заявку на кредит", en: "Applied for a loan" },
    motivation: {
      uz: "Ariza topshirildi — bank javobini kutamiz.",
      ru: "Заявка подана — осталось дождаться решения банка.",
      en: "Application submitted — now waiting for the bank's decision.",
    },
  },
  {
    id: "step_4",
    text: { uz: "Kredit oldim", ru: "Получил кредит", en: "Received the loan" },
    motivation: {
      uz: "Moliyalashtirish olingan! Asbob-uskunalar sotib olish vaqti.",
      ru: "Финансирование получено! Пора закупать оборудование.",
      en: "Funding secured! Time to purchase equipment.",
    },
  },
  {
    id: "step_5",
    text: { uz: "Biznesni ochdim", ru: "Открыл бизнес", en: "Opened the business" },
    motivation: {
      uz: "Ochilishi bilan tabriklaymiz! Birinchi mijozlar kutmoqda.",
      ru: "Поздравляем с открытием! Первые клиенты уже ждут.",
      en: "Congratulations on opening! Your first customers are waiting.",
    },
  },
  {
    id: "step_6",
    text: { uz: "3+ oy ishlamoqdaman", ru: "Работаю 3+ месяца", en: "Operating for 3+ months" },
    motivation: {
      uz: "Eng qiyin bosqichni yengdingiz! O'z hikoyangizni boshqalarga aytib bering.",
      ru: "Вы преодолели самый сложный этап! Расскажите другим свою историю.",
      en: "You've overcome the hardest stage! Share your story with others.",
    },
  },
];

interface ProgressStepsProps {
  lang: Locale;
  sessionId: string;
  districtId: string;
  businessTypeId: string;
  completedSteps: Set<string>;
  onStepComplete: (stepId: string) => void;
}

export default function ProgressSteps({
  lang, sessionId, districtId, businessTypeId, completedSteps, onStepComplete,
}: ProgressStepsProps) {
  const [confettiStep, setConfettiStep] = useState<string | null>(null);
  const [storyText, setStoryText] = useState("");
  const [storySent, setStorySent] = useState(false);

  const completedCount = STEPS.filter((s) => completedSteps.has(s.id)).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  const handleComplete = useCallback(async (stepId: string) => {
    setConfettiStep(stepId);
    setTimeout(() => setConfettiStep(null), 1500);
    onStepComplete(stepId);

    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, step: stepId }),
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [sessionId, onStepComplete]);

  const handleSubmitStory = useCallback(async () => {
    if (!storyText.trim()) return;
    try {
      await fetch("/api/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId, districtId, businessTypeId,
          storyRu: lang === "ru" ? storyText : "",
          storyUz: lang === "uz" ? storyText : "",
        }),
      });
      setStorySent(true);
    } catch (err) {
      console.error("Failed to submit story:", err);
    }
  }, [storyText, sessionId, districtId, businessTypeId, lang]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            {t(lang, `${completedCount} / ${STEPS.length} qadam`, `${completedCount} из ${STEPS.length} шагов`, `${completedCount} of ${STEPS.length} steps`)}
          </span>
          <span className="text-sm font-medium text-primary">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-1">
          {STEPS.map((step, i) => {
            const isDone = completedSteps.has(step.id);
            const isNext = !isDone && (i === 0 || completedSteps.has(STEPS[i - 1].id));
            const showConfetti = confettiStep === step.id;
            const isLast = i === STEPS.length - 1;

            return (
              <div key={step.id} className="relative pl-12 pb-6">
                <div className={`absolute left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isDone ? "bg-accent border-accent" : isNext ? "bg-white border-primary" : "bg-white border-gray-300"
                }`}>
                  {isDone && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isNext && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>

                {showConfetti && <div className="absolute left-1 -top-2 pointer-events-none"><div className="confetti-burst" /></div>}

                <div>
                  <span className={`font-medium ${isDone ? "text-accent" : isNext ? "text-foreground" : "text-gray-400"}`}>
                    {step.text[lang]}
                    {isLast && isDone && " \uD83C\uDF89"}
                  </span>

                  {isDone && (
                    <p className="text-sm text-gray-500 mt-1 question-enter">{step.motivation[lang]}</p>
                  )}

                  {isNext && !isDone && (
                    <button
                      onClick={() => handleComplete(step.id)}
                      className="mt-2 px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: "#1EBBD7" }}
                    >
                      {t(lang, "Bajarildi deb belgilash", "Отметить выполнено", "Mark as done")}
                    </button>
                  )}

                  {isLast && isDone && !storySent && (
                    <div className="mt-3 question-enter">
                      <p className="text-sm text-gray-600 mb-2">
                        {t(lang,
                          "O'z hikoyangizni aytib bering — bu tumaningizdagi boshqalarga yordam beradi:",
                          "Расскажите вашу историю — это поможет другим из вашего района:",
                          "Share your story — it will help others in your district:"
                        )}
                      </p>
                      <textarea
                        value={storyText}
                        onChange={(e) => setStoryText(e.target.value)}
                        rows={3}
                        placeholder={t(lang,
                          "Qanday boshladingiz, nima yordam berdi, qanday maslahat berasiz...",
                          "Как вы начали, что помогло, какой совет дадите...",
                          "How did you start, what helped, what advice would you give..."
                        )}
                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-sm resize-none transition-colors"
                      />
                      <button
                        onClick={handleSubmitStory}
                        disabled={!storyText.trim()}
                        className="mt-2 px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40"
                        style={{ backgroundColor: "#3BB741" }}
                      >
                        {t(lang, "Hikoyani yuborish", "Отправить историю", "Submit story")}
                      </button>
                    </div>
                  )}

                  {isLast && isDone && storySent && (
                    <p className="mt-2 text-sm text-accent font-medium question-enter">
                      {t(lang,
                        "Rahmat! Hikoyangiz moderatsiyaga yuborildi.",
                        "Спасибо! Ваша история отправлена на модерацию.",
                        "Thank you! Your story has been submitted for review."
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { STEPS };
