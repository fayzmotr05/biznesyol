import type { SurveyAnswers, ScoredBusiness, BankMatch, District } from "@/types";

interface BuildPromptParams {
  business: ScoredBusiness;
  bank: BankMatch;
  answers: SurveyAnswers;
  district: District;
}

export function buildBusinessPlanPrompt(params: BuildPromptParams): {
  system: string;
  user: string;
} {
  const { business, bank, answers, district } = params;
  const lang = answers.lang === "uz" ? "uz" : "ru";
  const biz = business.business_type;
  const bp = bank.bank_product;

  const system =
    lang === "ru"
      ? `Ты — опытный бизнес-консультант по малому бизнесу в Узбекистане.

Правила:
- Отвечай ТОЛЬКО на русском языке.
- Будь практичным и конкретным. Без воды, общих фраз и мотивационных речей.
- Все суммы указывай в узбекских сумах (млн сум).
- ОБЯЗАТЕЛЬНО используй слова "ориентировочно", "возможно", "по оценке" — НИКОГДА не давай гарантий.
- Учитывай специфику района: население, тип (город/село), конкуренцию.
- Ответ — строго JSON без markdown-обёрток, без \`\`\`json.`
      : `Sen — O'zbekistonda kichik biznes bo'yicha tajribali biznes-maslahatchi.

Qoidalar:
- FAQAT o'zbek tilida javob ber (lotin alifbosi).
- Amaliy va aniq bo'l. Suv quyma, umumiy gaplar va motivatsion nutqlar kerak emas.
- Barcha summalarni o'zbek so'mida (mln so'm) ko'rsat.
- ALBATTA "taxminan", "ehtimol", "baholash bo'yicha" so'zlarini ishlat — HECH QACHON kafolat berma.
- Tumanning xususiyatlarini hisobga ol: aholi soni, turi (shahar/qishloq), raqobat.
- Javob — faqat JSON, markdown-o'rash yoki \`\`\`json bo'lmasin.`;

  const skillsList = Array.isArray(answers.skills)
    ? answers.skills.join(", ")
    : answers.skills ?? "";

  const user =
    lang === "ru"
      ? `Составь бизнес-план для следующего пользователя:

Район: ${district.name_ru} (${district.region_ru}), тип: ${district.type}, население: ${district.population.toLocaleString()}
Вид бизнеса: ${biz.name_ru} (${biz.category})
Навыки пользователя: ${skillsList}
Стартовый капитал: ${answers.capital} млн сум
Залог: ${answers.collateral}
Помещение: ${answers.premises}
Конкуренция рядом: ${answers.competition}
Приоритет: ${answers.priority === "fast" ? "быстрый старт" : "стабильность"}
Возраст: ${answers.age_group}
Score бизнеса: ${business.total_score} (навыки: ${business.breakdown.skills_match}, капитал: ${business.breakdown.capital_sufficient}, конкуренция: ${business.breakdown.competition_low})

Рекомендуемый банк: ${bp.bank_name_ru} — ${bp.product_name_ru}
Сумма кредита: ${bp.min_amount_mln}–${bp.max_amount_mln} млн сум
Ставка: ${bp.interest_rate_annual}% годовых
Срок: до ${bp.term_months_max} месяцев
Причины выбора банка: ${bank.match_reasons.join("; ")}

Средняя выручка бизнеса: ${biz.avg_monthly_revenue_mln} млн сум/мес
Средние расходы: ${biz.avg_monthly_expense_mln} млн сум/мес
Срок окупаемости: ~${biz.breakeven_months} мес

Верни строго JSON (без markdown):
{
  "summary": "краткое описание бизнес-идеи (2-3 предложения)",
  "target_audience": "целевая аудитория в этом районе",
  "startup_costs": [{ "item": "название расхода", "amount_mln": число }],
  "monthly_forecast": { "revenue_mln": число, "expenses_mln": число, "profit_mln": число },
  "breakeven_months": число,
  "risks": [{ "risk": "описание риска", "mitigation": "как снизить" }],
  "mentor_note": "один практичный совет от опытного предпринимателя"
}`
      : `Quyidagi foydalanuvchi uchun biznes-reja tuz:

Tuman: ${district.name_uz} (${district.region_uz}), turi: ${district.type}, aholi: ${district.population.toLocaleString()}
Biznes turi: ${biz.name_uz} (${biz.category})
Foydalanuvchi ko'nikmalari: ${skillsList}
Boshlang'ich kapital: ${answers.capital} mln so'm
Garov: ${answers.collateral}
Joy: ${answers.premises}
Yaqin atrofdagi raqobat: ${answers.competition}
Ustuvorlik: ${answers.priority === "fast" ? "tez boshlash" : "barqarorlik"}
Yosh: ${answers.age_group}
Biznes bahosi: ${business.total_score}

Tavsiya etilgan bank: ${bp.bank_name_uz} — ${bp.product_name_uz}
Kredit summasi: ${bp.min_amount_mln}–${bp.max_amount_mln} mln so'm
Stavka: ${bp.interest_rate_annual}% yillik
Muddat: ${bp.term_months_max} oygacha
Bank tanlash sabablari: ${bank.match_reasons.join("; ")}

O'rtacha daromad: ${biz.avg_monthly_revenue_mln} mln so'm/oy
O'rtacha xarajat: ${biz.avg_monthly_expense_mln} mln so'm/oy
O'zini qoplash muddati: ~${biz.breakeven_months} oy

Faqat JSON qaytar (markdown bo'lmasin):
{
  "summary": "biznes g'oyasining qisqacha tavsifi (2-3 jumla)",
  "target_audience": "bu tumandagi maqsadli auditoriya",
  "startup_costs": [{ "item": "xarajat nomi", "amount_mln": raqam }],
  "monthly_forecast": { "revenue_mln": raqam, "expenses_mln": raqam, "profit_mln": raqam },
  "breakeven_months": raqam,
  "risks": [{ "risk": "xavf tavsifi", "mitigation": "qanday kamaytirish" }],
  "mentor_note": "tajribali tadbirkordan bitta amaliy maslahat"
}`;

  return { system, user };
}
