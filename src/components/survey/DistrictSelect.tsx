"use client";

import { useState, useMemo } from "react";
import type { Locale, District } from "@/types";
import { t, localized } from "@/lib/i18n";
import districtsData from "../../../data/districts.json";

const districts = districtsData as District[];

interface DistrictSelectProps {
  lang: Locale;
  onSelect: (districtId: string) => void;
}

export default function DistrictSelect({ lang, onSelect }: DistrictSelectProps) {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, District[]>();
    for (const d of districts) {
      const region = localized(d as unknown as Record<string, unknown>, "region", lang);
      if (!map.has(region)) map.set(region, []);
      map.get(region)!.push(d);
    }
    return map;
  }, [lang]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result = new Map<string, District[]>();
    for (const [region, items] of grouped) {
      const matches = items.filter((d) => {
        const name = localized(d as unknown as Record<string, unknown>, "name", lang);
        return name.toLowerCase().includes(q) || region.toLowerCase().includes(q);
      });
      if (matches.length > 0) result.set(region, matches);
    }
    return result;
  }, [search, grouped, lang]);

  return (
    <div className="question-enter w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center">
        {t(lang,
          "Qaysi tumanda yashaysiz?",
          "В каком районе вы живёте?",
          "Which district do you live in?"
        )}
      </h2>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 7.5a7.5 7.5 0 0013.15 9.15z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(lang, "Tumanni qidirish...", "Поиск района...", "Search district...")}
          className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
        {filtered.size === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            {t(lang, "Hech narsa topilmadi", "Ничего не найдено", "No results found")}
          </div>
        )}
        {[...filtered.entries()].map(([region, items]) => (
          <div key={region}>
            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky top-0">
              {region}
            </div>
            {items.map((d) => {
              const name = localized(d as unknown as Record<string, unknown>, "name", lang);
              return (
                <button
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors flex justify-between items-center"
                >
                  <span>{name}</span>
                  <span className="text-xs text-gray-400">{d.population.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
