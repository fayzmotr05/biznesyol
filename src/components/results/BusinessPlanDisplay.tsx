"use client";

import type { BusinessPlanResult, Locale } from "@/types";
import { t } from "@/lib/i18n";

interface BusinessPlanDisplayProps {
  planJson: BusinessPlanResult | null;
  isLoading: boolean;
  lang: Locale;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export default function BusinessPlanDisplay({ planJson, isLoading, lang }: BusinessPlanDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 question-enter">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!planJson) return null;
  const plan = planJson;

  return (
    <div className="question-enter space-y-5">
      <div>
        <h4 className="font-semibold mb-2">{t(lang, "Biznes-reja", "Бизнес-план", "Business plan")}</h4>
        <p className="text-sm text-gray-700 leading-relaxed bg-primary/5 p-4 rounded-xl">{plan.summary}</p>
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-500 mb-1">
          {t(lang, "Maqsadli auditoriya", "Целевая аудитория", "Target audience")}
        </h5>
        <p className="text-sm text-gray-700">{plan.target_audience}</p>
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-500 mb-2">
          {t(lang, "Boshlang'ich xarajatlar", "Стартовые расходы", "Startup costs")}
        </h5>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-600">
                  {t(lang, "Band", "Статья", "Item")}
                </th>
                <th className="text-right p-3 font-medium text-gray-600">
                  {t(lang, "Summa (mln)", "Сумма (млн)", "Amount (M)")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plan.startup_costs.map((cost, i) => (
                <tr key={i}>
                  <td className="p-3 text-gray-700">{cost.item}</td>
                  <td className="p-3 text-right font-medium">{cost.amount_mln}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="p-3">{t(lang, "Jami", "Итого", "Total")}</td>
                <td className="p-3 text-right text-primary">
                  {plan.startup_costs.reduce((sum, c) => sum + c.amount_mln, 0).toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-500 mb-2">
          {t(lang, "Oylik prognoz (taxminan)", "Прогноз на месяц (ориентировочно)", "Monthly forecast (estimated)")}
        </h5>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-lg font-bold text-primary">{plan.monthly_forecast.revenue_mln}</div>
            <div className="text-xs text-gray-500">{t(lang, "Daromad", "Выручка", "Revenue")}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-lg font-bold text-red-400">{plan.monthly_forecast.expenses_mln}</div>
            <div className="text-xs text-gray-500">{t(lang, "Xarajat", "Расходы", "Expenses")}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-lg font-bold text-accent">{plan.monthly_forecast.profit_mln}</div>
            <div className="text-xs text-gray-500">{t(lang, "Foyda", "Прибыль", "Profit")}</div>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {t(lang,
            `O'zini qoplash: ~${plan.breakeven_months} oy`,
            `Окупаемость: ~${plan.breakeven_months} мес`,
            `Breakeven: ~${plan.breakeven_months} months`
          )}
        </p>
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-500 mb-2">
          {t(lang, "Mumkin bo'lgan xavflar", "Возможные риски", "Potential risks")}
        </h5>
        <div className="space-y-2">
          {plan.risks.map((r, i) => (
            <div key={i} className="bg-red-50/50 rounded-xl p-3">
              <p className="text-sm font-medium text-red-700">{r.risk}</p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="text-accent font-medium">&#8594; </span>{r.mitigation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {plan.mentor_note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{t(lang, "Maslahat:", "Совет:", "Tip:")} </span>
            {plan.mentor_note}
          </p>
        </div>
      )}
    </div>
  );
}
