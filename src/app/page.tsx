"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/types";
import { getSavedLang, t } from "@/lib/i18n";

const STEPS = [
  {
    num: "01",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    title: { uz: "So'rovnomani to'ldiring", ru: "Пройдите опрос", en: "Complete the survey" },
    desc: { uz: "5 daqiqalik savollarga javob bering — ro'yxatdan o'tish shart emas", ru: "Ответьте на вопросы за 5 минут — без регистрации", en: "Answer questions in 5 minutes — no registration needed" },
  },
  {
    num: "02",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
      </svg>
    ),
    title: { uz: "Biznes tavsiyalar oling", ru: "Получите рекомендации", en: "Get recommendations" },
    desc: { uz: "AI sizning ko'nikmalaringiz va hududingizga mos biznes turlarini tanlaydi", ru: "AI подберёт бизнес под ваши навыки и район", en: "AI matches businesses to your skills and district" },
  },
  {
    num: "03",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><path d="M1 10h22" />
      </svg>
    ),
    title: { uz: "Bank va reja tanlang", ru: "Выберите банк и план", en: "Pick a bank and plan" },
    desc: { uz: "Garovsiz kredit, imtiyozli dasturlar va tayyor biznes-reja", ru: "Кредит без залога, льготные программы и готовый бизнес-план", en: "No-collateral loans, subsidized programs, and a ready business plan" },
  },
];

const STATS = [
  { value: "600K+", label: { uz: "O'zbekistonda kichik bizneslar", ru: "Малых бизнесов в Узбекистане", en: "Small businesses in Uzbekistan" } },
  { value: "54%", label: { uz: "YaIMdagi KBning ulushi", ru: "Доля МСБ в ВВП", en: "SME share of GDP" } },
  { value: "7", label: { uz: "Bank kredit dasturlari", ru: "Банковских кредитных программ", en: "Bank loan programs" } },
];

export default function LandingPage() {
  const [lang, setLang] = useState<Locale>("uz");

  useEffect(() => {
    setLang(getSavedLang());
    const handler = () => setLang(getSavedLang());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="px-4 pt-12 sm:pt-20 pb-16 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium mb-6 fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            {t(lang, "Bepul platforma", "Бесплатная платформа", "Free platform")}
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5 fade-in">
            {lang === "uz" && <>O&#39;z biznesingizni boshlash<br />uchun <span className="text-primary">aniq reja</span> oling</>}
            {lang === "ru" && <>Получите <span className="text-primary">чёткий план</span><br />для старта бизнеса</>}
            {lang === "en" && <>Get a <span className="text-primary">clear plan</span><br />to start your business</>}
          </h1>

          <p className="text-lg text-muted max-w-md mx-auto mb-8 fade-in-delay">
            {t(lang,
              "Tumaningiz, ko'nikmalaringiz va byudjetingizga mos biznes turi, bank krediti va bosqichma-bosqich reja.",
              "Вид бизнеса, банковский кредит и пошаговый план под ваш район, навыки и бюджет.",
              "Business type, bank loan, and step-by-step plan matched to your district, skills, and budget."
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 fade-in-delay">
            <Link
              href="/survey"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-base transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
            >
              {t(lang, "Boshlash", "Начать", "Get started")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-sm text-muted">
              {t(lang, "5 daqiqa \u00b7 Ro'yxatdan o'tishsiz", "5 минут \u00b7 Без регистрации", "5 min \u00b7 No sign-up")}
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-16 max-w-2xl mx-auto">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest text-center mb-8">
          {t(lang, "Qanday ishlaydi", "Как это работает", "How it works")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.num} className="relative bg-surface rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="text-[40px] font-black text-border/60 absolute top-4 right-5 select-none">{step.num}</div>
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold mb-1.5">{step.title[lang]}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-16 max-w-2xl mx-auto">
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
          <div className="grid grid-cols-3 divide-x divide-border">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted mt-1">{stat.label[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 max-w-2xl mx-auto text-center">
        <div className="bg-primary rounded-2xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl font-bold mb-3">
            {t(lang,
              "Biznesingizni bugun boshlang",
              "Начните бизнес уже сегодня",
              "Start your business today"
            )}
          </h2>
          <p className="text-white/70 mb-6 max-w-sm mx-auto">
            {t(lang,
              "So'rovnomani to'ldiring va o'zingizga mos biznes turini bilib oling",
              "Пройдите опрос и узнайте какой бизнес вам подходит",
              "Take the survey and discover which business fits you"
            )}
          </p>
          <Link
            href="/survey"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
          >
            {t(lang, "Bepul boshlash", "Начать бесплатно", "Start for free")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 pb-8 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>{t(lang,
            "Tavsiyalar taxminiy xarakterga ega va natija kafolati emas.",
            "Рекомендации носят информационный характер и не гарантируют результат.",
            "Recommendations are informational and do not guarantee results."
          )}</p>
          <p className="opacity-50">2026 BiznesYo&#39;l</p>
        </div>
      </footer>
    </main>
  );
}
