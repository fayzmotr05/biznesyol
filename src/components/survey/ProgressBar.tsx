"use client";

import type { Locale } from "@/types";
import { t } from "@/lib/i18n";

interface ProgressBarProps {
  current: number;
  total: number;
  lang: Locale;
}

export default function ProgressBar({ current, total, lang }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          {t(lang,
            `${current}-savol ${total}-dan`,
            `Вопрос ${current} из ${total}`,
            `Question ${current} of ${total}`
          )}
        </span>
        <span className="text-sm font-medium text-primary">{pct}%</span>
      </div>
      <div
        className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${current} of ${total}`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
