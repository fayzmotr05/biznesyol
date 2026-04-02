"use client";

import type { BusinessPlanResult, Locale } from "@/types";
import { t } from "@/lib/i18n";

interface Props {
  planJson: BusinessPlanResult | null;
  isLoading: boolean;
  lang: Locale;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

function num(v: number | string | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

export default function BusinessPlanDisplay({ planJson, isLoading, lang }: Props) {
  if (isLoading) {
    return (
      <div className="question-enter mt-4">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">
            {t(lang, "AI biznes-reja tayyorlamoqda...", "AI создаёт бизнес-план...", "AI is generating your business plan...")}
          </h3>
          <p className="text-sm text-muted">
            {t(lang,
              "Bu 15-30 soniya vaqt oladi. Sizning ma'lumotlaringiz, tuman statistikasi va Asakabank kredit mahsulotlari tahlil qilinmoqda.",
              "Это займёт 15-30 секунд. Анализируем ваши данные, статистику района и кредитные продукты Асакабанка.",
              "This takes 15-30 seconds. Analyzing your data, district statistics and Asakabank loan products."
            )}
          </p>
        </div>
        <div className="space-y-3 mt-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!planJson) return null;
  const plan = planJson;

  const items = plan.startup_items || plan.startup_costs?.map((c) => ({ item: c.item, price_mln: c.amount_mln, where_to_buy: "" })) || [];
  const forecast = plan.monthly_plan || plan.monthly_forecast || { revenue_mln: 0, expenses_mln: 0, profit_mln: 0 };
  const totalStartup = items.reduce((sum, i) => sum + num(i.price_mln), 0);

  return (
    <div className="question-enter space-y-5 mt-4">
      {/* Business name + summary */}
      {plan.business_name && (
        <h3 className="text-xl font-bold text-primary">{plan.business_name}</h3>
      )}
      <div className="bg-primary/5 p-4 rounded-xl">
        <p className="text-sm leading-relaxed">{plan.summary}</p>
      </div>

      {/* Why this business */}
      {plan.why_this_business && (
        <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-accent mb-1">
            {t(lang, "Nega aynan shu biznes?", "Почему именно этот бизнес?", "Why this business?")}
          </h4>
          <p className="text-sm">{plan.why_this_business}</p>
        </div>
      )}

      {/* Startup items with prices */}
      {items.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted mb-2">
            {t(lang, "Kerakli narsalar va narxlar", "Что нужно купить", "What you need to buy")}
          </h4>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background">
                  <th className="text-left p-3 font-medium">{t(lang, "Nomi", "Название", "Item")}</th>
                  <th className="text-right p-3 font-medium w-24">{t(lang, "Narx", "Цена", "Price")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="p-3">
                      <div>{item.item}</div>
                      {item.where_to_buy && (
                        <div className="text-xs text-muted mt-0.5">{item.where_to_buy}</div>
                      )}
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">{num(item.price_mln).toFixed(1)} mln</td>
                  </tr>
                ))}
                <tr className="bg-background font-semibold">
                  <td className="p-3">{t(lang, "Jami", "Итого", "Total")}</td>
                  <td className="p-3 text-right text-primary">{totalStartup.toFixed(1)} mln</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly forecast */}
      <div>
        <h4 className="text-sm font-semibold text-muted mb-2">
          {t(lang, "Oylik prognoz (taxminan)", "Прогноз на месяц", "Monthly forecast")}
        </h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-background rounded-xl p-3 border border-border">
            <div className="text-lg font-bold text-primary">{num(forecast.revenue_mln).toFixed(1)}</div>
            <div className="text-xs text-muted">{t(lang, "Daromad", "Выручка", "Revenue")}</div>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <div className="text-lg font-bold text-red-400">{num(forecast.expenses_mln).toFixed(1)}</div>
            <div className="text-xs text-muted">{t(lang, "Xarajat", "Расходы", "Expenses")}</div>
          </div>
          <div className="bg-accent/5 rounded-xl p-3 border border-accent/20">
            <div className="text-lg font-bold text-accent">{num(forecast.profit_mln).toFixed(1)}</div>
            <div className="text-xs text-muted">{t(lang, "Foyda", "Прибыль", "Profit")}</div>
          </div>
        </div>
        <p className="text-center text-sm text-muted mt-2">
          {t(lang, `O'zini qoplash: ~${plan.breakeven_months} oy`, `Окупаемость: ~${plan.breakeven_months} мес`, `Breakeven: ~${plan.breakeven_months} months`)}
        </p>
      </div>

      {/* Recommended Asaka loan */}
      {plan.recommended_loan && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-1">
            Asakabank: {plan.recommended_loan.name}
          </h4>
          <p className="text-sm text-blue-700">
            {num(plan.recommended_loan.amount_mln).toFixed(1)} mln so'm &middot; {plan.recommended_loan.rate}
          </p>
          <p className="text-sm text-blue-600 mt-1">{plan.recommended_loan.why}</p>
        </div>
      )}

      {/* First steps */}
      {plan.first_steps && plan.first_steps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted mb-2">
            {t(lang, "Birinchi qadamlar", "Первые шаги", "First steps")}
          </h4>
          <ol className="space-y-2">
            {plan.first_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 bg-background rounded-xl p-3 border border-border">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Risks */}
      {plan.risks && plan.risks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted mb-2">
            {t(lang, "Xavflar va yechimlar", "Риски и решения", "Risks and solutions")}
          </h4>
          <div className="space-y-2">
            {plan.risks.map((r, i) => (
              <div key={i} className="bg-red-50/50 rounded-xl p-3 border border-red-100">
                <p className="text-sm font-medium text-red-700">{r.risk}</p>
                <p className="text-sm text-muted mt-1">→ {r.solution || r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      {(plan.tip || plan.mentor_note) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{t(lang, "Maslahat:", "Совет:", "Tip:")} </span>
            {plan.tip || plan.mentor_note}
          </p>
        </div>
      )}
    </div>
  );
}
