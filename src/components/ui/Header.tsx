"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/types";
import { DEFAULT_LOCALE, LANG_KEY, getSavedLang, saveLang } from "@/lib/i18n";

const LANGS: { value: Locale; label: string }[] = [
  { value: "uz", label: "O'z" },
  { value: "ru", label: "Рус" },
  { value: "en", label: "Eng" },
];

interface HeaderProps {
  onLangChange?: (lang: Locale) => void;
}

export default function Header({ onLangChange }: HeaderProps) {
  const [lang, setLang] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => { setLang(getSavedLang()); }, []);

  function selectLang(l: Locale) {
    setLang(l);
    saveLang(l);
    onLangChange?.(l);
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <header className="w-full bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="leading-tight">
            <span className="font-bold text-base tracking-tight text-foreground">BiznesYo&#39;l</span>
            <span className="hidden sm:block text-[11px] text-muted -mt-0.5">Biznes rejalashtirish platformasi</span>
          </div>
        </Link>

        <div className="flex items-center gap-1 bg-background rounded-lg p-1">
          {LANGS.map((l) => (
            <button
              key={l.value}
              onClick={() => selectLang(l.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                lang === l.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
