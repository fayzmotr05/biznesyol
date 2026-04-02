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
              "Bu 20-40 soniya vaqt oladi. Internet orqali haqiqiy narxlar qidirilmoqda.",
              "Это займёт 20-40 секунд. Ищем реальные цены в интернете.",
              "This takes 20-40 seconds. Searching real prices online."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!planJson) return null;
  const plan = planJson;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = plan as any;
  const items: Array<{ item: string; price: string; where_to_buy: string }> =
    (raw.startup_items || raw.startup_costs || []).map((i: Record<string, string>) => ({
      item: i.item || "", price: String(i.price || i.price_mln || i.amount_mln || ""), where_to_buy: i.where_to_buy || "",
    }));
  const forecast = raw.monthly_plan || raw.monthly_forecast || {};
  const fRevenue = String(forecast.revenue || forecast.revenue_mln || "");
  const fExpenses = String(forecast.expenses || forecast.expenses_mln || "");
  const fProfit = String(forecast.profit || forecast.profit_mln || "");

  return (
    <div className="question-enter space-y-5 mt-4">
      {plan.business_name && (
        <h3 className="text-xl font-bold text-primary">{plan.business_name}</h3>
      )}

      <div className="bg-primary/5 p-4 rounded-xl">
        <p className="text-sm leading-relaxed">{plan.summary}</p>
      </div>

      {plan.why_this_business && (
        <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl">
          <h4 className="text-sm font-semibold text-accent mb-1">
            {t(lang, "Nega aynan shu biznes?", "Почему именно этот бизнес?", "Why this business?")}
          </h4>
          <p className="text-sm">{plan.why_this_business}</p>
        </div>
      )}

      {/* Startup items */}
      {items.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted mb-2">
            {t(lang, "Kerakli narsalar va narxlar", "Что нужно купить", "What you need to buy")}
          </h4>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="bg-background rounded-xl border border-border p-3 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.item}</div>
                  {item.where_to_buy && <div className="text-xs text-muted mt-0.5">{item.where_to_buy}</div>}
                </div>
                <div className="text-sm font-bold text-primary whitespace-nowrap">{String(item.price || "")}</div>
              </div>
            ))}
          </div>
          {plan.total_startup_cost && (
            <div className="mt-2 p-3 bg-primary/5 rounded-xl flex justify-between">
              <span className="font-semibold">{t(lang, "Jami", "Итого", "Total")}</span>
              <span className="font-bold text-primary">{String(plan.total_startup_cost)}</span>
            </div>
          )}
          {plan.loan_needed && (
            <div className="mt-1 p-3 bg-yellow-50 rounded-xl flex justify-between">
              <span className="text-sm">{t(lang, "Kredit kerak", "Нужен кредит", "Loan needed")}</span>
              <span className="font-bold text-yellow-700">{String(plan.loan_needed)}</span>
            </div>
          )}
        </div>
      )}

      {/* Monthly forecast */}
      {fRevenue && (
        <div>
          <h4 className="text-sm font-semibold text-muted mb-2">
            {t(lang, "Oylik prognoz (taxminan)", "Месячный прогноз", "Monthly forecast")}
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-background rounded-xl p-3 border border-border">
              <div className="text-base font-bold text-primary">{fRevenue}</div>
              <div className="text-xs text-muted">{t(lang, "Daromad", "Выручка", "Revenue")}</div>
            </div>
            <div className="bg-background rounded-xl p-3 border border-border">
              <div className="text-base font-bold text-red-400">{fExpenses}</div>
              <div className="text-xs text-muted">{t(lang, "Xarajat", "Расходы", "Expenses")}</div>
            </div>
            <div className="bg-accent/5 rounded-xl p-3 border border-accent/20">
              <div className="text-base font-bold text-accent">{fProfit}</div>
              <div className="text-xs text-muted">{t(lang, "Foyda", "Прибыль", "Profit")}</div>
            </div>
          </div>
          <p className="text-center text-sm text-muted mt-2">
            {t(lang, `O'zini qoplash: ~${plan.breakeven_months} oy`, `Окупаемость: ~${plan.breakeven_months} мес`, `Breakeven: ~${plan.breakeven_months} months`)}
          </p>
        </div>
      )}

      {/* Recommended loan */}
      {plan.recommended_loan && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-1">
            Asakabank: {plan.recommended_loan.name}
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            {plan.recommended_loan.amount && <p>Summa: {plan.recommended_loan.amount}</p>}
            <p>Stavka: {plan.recommended_loan.rate}</p>
            {plan.recommended_loan.term && <p>Muddat: {plan.recommended_loan.term}</p>}
          </div>
          <p className="text-sm text-blue-600 mt-2">{plan.recommended_loan.why}</p>
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
