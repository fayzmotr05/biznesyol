import type { Locale } from "@/types";

export const DEFAULT_LOCALE: Locale = "uz";

export const LANG_KEY = "asaka_lang";

/**
 * Pick the right string for the current locale.
 * Usage: t(lang, "O'zbek matni", "Русский текст", "English text")
 */
export function t(lang: Locale, uz: string, ru: string, en: string): string {
  switch (lang) {
    case "uz": return uz;
    case "ru": return ru;
    case "en": return en;
    default: return uz;
  }
}

/**
 * Pick a field from data objects that have _uz, _ru suffixes.
 * Falls back to _ru for en since data files don't have _en fields.
 */
export function localized(
  obj: Record<string, unknown>,
  field: string,
  lang: Locale
): string {
  if (lang === "en") {
    // Data files only have _uz and _ru — fallback to _ru for English users
    return (obj[`${field}_en`] as string) || (obj[`${field}_ru`] as string) || "";
  }
  return (obj[`${field}_${lang}`] as string) || "";
}

export function getSavedLang(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "uz" || saved === "ru" || saved === "en") return saved;
  return DEFAULT_LOCALE;
}

export function saveLang(lang: Locale) {
  localStorage.setItem(LANG_KEY, lang);
}
