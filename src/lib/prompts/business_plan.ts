import type { SurveyAnswers, ScoredBusiness, BankMatch, District } from "@/types";

interface DistrictDataRow {
  population?: number;
  unemployment_rate?: number;
  poverty_rate?: number;
  poverty_families?: number;
  small_businesses_count?: number;
  individual_entrepreneurs?: number;
  sme_loans_bln?: number;
  key_sectors?: string[];
  recommended_sectors?: string[];
  kindergarten_coverage_pct?: number;
  markets_count?: number;
  vacant_jobs?: number;
  notes?: string;
  [key: string]: unknown;
}

interface BuildPromptParams {
  business: ScoredBusiness;
  bank: BankMatch;
  answers: SurveyAnswers;
  district: District;
  districtData?: DistrictDataRow | null;
}

export function buildBusinessPlanPrompt(params: BuildPromptParams): {
  system: string;
  user: string;
} {
  const { business, bank, answers, district, districtData } = params;
  const lang = answers.lang === "uz" ? "uz" : answers.lang === "en" ? "en" : "ru";
  const biz = business.business_type;
  const bp = bank.bank_product;

  // Build district context block from admin data
  let districtContext = "";
  if (districtData) {
    const d = districtData;
    const lines: string[] = [];
    if (d.population) lines.push(`Aholi: ${d.population.toLocaleString()}`);
    if (d.unemployment_rate) lines.push(`Ishsizlik: ${d.unemployment_rate}%`);
    if (d.poverty_rate) lines.push(`Kambagrlik: ${d.poverty_rate}%`);
    if (d.small_businesses_count) lines.push(`Kichik bizneslar: ${d.small_businesses_count}`);
    if (d.individual_entrepreneurs) lines.push(`YaTT lar: ${d.individual_entrepreneurs}`);
    if (d.sme_loans_bln) lines.push(`KBga kreditlar: ${d.sme_loans_bln} mlrd so'm`);
    if (d.markets_count) lines.push(`Bozorlar: ${d.markets_count}`);
    if (d.vacant_jobs) lines.push(`Bo'sh ish o'rinlari: ${d.vacant_jobs}`);
    if (d.key_sectors?.length) lines.push(`Asosiy sohalar: ${d.key_sectors.join(", ")}`);
    if (d.recommended_sectors?.length) lines.push(`Tavsiya etilgan sohalar: ${d.recommended_sectors.join(", ")}`);
    if (d.kindergarten_coverage_pct) lines.push(`MTM qamrovi: ${d.kindergarten_coverage_pct}%`);
    if (d.notes) lines.push(`Qo'shimcha: ${d.notes}`);
    if (lines.length > 0) {
      districtContext = "\n\nTUMAN STATISTIKASI (admin tomonidan kiritilgan haqiqiy ma'lumotlar):\n" + lines.join("\n");
    }
  }

  const systemPrompts: Record<string, string> = {
    ru: `Ты — опытный бизнес-консультант в Узбекистане. Даёшь ТОЛЬКО практичные, конкретные советы.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
- Бизнес-план СТРОГО соответствует выбранной сфере пользователя. Если выбрано "шитьё" — план ТОЛЬКО про швейный бизнес, НЕ про IT.
- Если пользователю не хватает оборудования — предложи КОНКРЕТНЫЕ модели с ценами в Узбекистане (OLX.uz, Малика базар).
- Все суммы в млн сум. Используй "ориентировочно", "по оценке" — без гарантий.
- Учитывай данные района если предоставлены. Анализируй конкурентов.
- В startup_costs указывай КОНКРЕТНОЕ оборудование с моделями и ценами.
- Ответ — строго JSON без markdown.`,

    uz: `Sen — O'zbekistonda tajribali biznes-maslahatchi. FAQAT amaliy, aniq maslahatlar berasan.

MUHIM QOIDALAR:
- Biznes-reja foydalanuvchi tanlagan sohaga QATIY mos bo'lishi kerak. Agar "tikuvchilik" tanlangan bo'lsa — reja FAQAT tikuvchilik haqida, IT haqida EMAS.
- Agar foydalanuvchida jihozlar yetishmasa — ANIQ modellar va O'zbekistondagi narxlarini tavsiya qil (OLX.uz, Malika bozori, Sergeli bozori).
- Barcha summalar mln so'mda. "Taxminan", "baholash bo'yicha" so'zlarini ishlat — kafolat berma.
- Tuman ma'lumotlari berilgan bo'lsa — ularni tahlil qil. Raqobatchilarni baholash.
- startup_costs da ANIQ jihozlar, modellar va narxlarini yoz.
- Javob — faqat JSON, markdown bo'lmasin.`,

    en: `You are an experienced business consultant in Uzbekistan. Give ONLY practical, specific advice.

CRITICAL RULES:
- Business plan MUST match the user's chosen field. If "sewing" is selected — plan is ONLY about sewing, NOT about IT.
- If user lacks equipment — suggest SPECIFIC models with prices in Uzbekistan (OLX.uz, Malika bazaar).
- All amounts in mln UZS. Use "approximately", "estimated" — no guarantees.
- Use district data if provided. Assess competition.
- In startup_costs list SPECIFIC equipment with models and prices.
- Response must be strict JSON without markdown.`,
  };

  const system = systemPrompts[lang] || systemPrompts.ru;

  const skillsList = Array.isArray(answers.skills)
    ? answers.skills.join(", ")
    : (answers.skills as string) ?? "";

  // Sphere-specific answers for deeper analysis
  const sphere = (answers.sphere as string) || "";
  const sphereAnswers: string[] = [];
  for (const [key, val] of Object.entries(answers)) {
    if (key.startsWith(`${sphere}_q`)) {
      sphereAnswers.push(`${key}: ${val}`);
    }
  }

  // User profile from registration
  const userName = (answers.user_name as string) || "";
  const userGender = (answers.user_gender_actual as string) || "";
  const userEducation = (answers.user_education as string) || "";
  const userIncome = (answers.user_income as string) || "";
  const userEmployment = (answers.user_employment as string) || "";
  const userExperience = (answers.user_experience as string) || "";
  const birthYear = parseInt((answers.user_birth_year as string) || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 0;

  const userBlock = `
FOYDALANUVCHI PROFILI:
Ism: ${userName}
Yosh: ${age > 0 ? age : "noma'lum"}
Jins: ${userGender === "female" ? "ayol" : userGender === "male" ? "erkak" : "noma'lum"}
Ta'lim: ${userEducation || "noma'lum"}
Hozirgi daromad: ${userIncome ? userIncome + " mln so'm/oy" : "noma'lum"}
Holati: ${userEmployment || "noma'lum"}
Biznes tajribasi: ${userExperience === "yes" ? "bor" : "yo'q"}`;

  const user = `DIQQAT: Biznes-reja FAQAT "${biz.name_uz}" haqida bo'lishi SHART. Boshqa soha tavsiya QILMA.

=== TUMAN MA'LUMOTLARI ===
Tuman: ${district.name_uz} (${district.region_uz}), turi: ${district.type}, aholi: ${district.population.toLocaleString()}
${districtContext}

=== FOYDALANUVCHI ===
${userBlock}

=== SOHA VA JAVOBLAR ===
Tanlangan soha: ${sphere}
Biznes turi: ${biz.name_uz}
Ko'nikmalari: ${skillsList}
Boshlang'ich kapital: ${answers.capital} mln so'm
Garov: ${answers.collateral}
Joy: ${answers.premises || "noma'lum"}
Raqobat yaqin atrofda: ${answers.competition}
Kam ta'minlangan oila: ${answers.poor_registry}
${sphereAnswers.length > 0 ? "\nSoha bo'yicha batafsil javoblar:\n" + sphereAnswers.join("\n") : ""}

=== BANK ===
Tavsiya: ${bp.bank_name_uz} — ${bp.product_name_uz}
Kredit: ${bp.min_amount_mln}–${bp.max_amount_mln} mln so'm, ${bp.interest_rate_annual}% yillik, ${bp.term_months_max} oygacha

=== MUHIM KO'RSATMALAR ===
1. startup_costs da ANIQ jihoz/uskuna nomlari va O'zbekistondagi narxlarini yoz.
   Masalan: "Tikuv mashinasi JUKI DDL-8700 (b/u OLX.uz)" — 3.5 mln, "Overlok JACK E4" — 4 mln.
   Agar foydalanuvchi javoblarida jihozi yo'q desa — kerakli jihozlarni aniq ko'rsat.
2. risks da bu tumanga xos xavflarni yoz (raqobat, suv/elektr muammolari va h.k.)
3. mentor_note da ANIQ, amaliy maslahat ber — "qayerdan boshlash", "qayerda mijoz topish"

Faqat JSON qaytar:
{
  "summary": "3-4 jumlada: nima qiladi, kimga xizmat qiladi, qancha daromad kutilmoqda — FAQAT ${biz.name_uz} haqida",
  "target_audience": "bu tumandagi aniq maqsadli mijozlar kimlar va ular qayerda",
  "startup_costs": [
    { "item": "ANIQ jihoz nomi va modeli (qayerdan olish mumkin)", "amount_mln": "narxi" }
  ],
  "monthly_forecast": { "revenue_mln": "raqam", "expenses_mln": "raqam", "profit_mln": "raqam" },
  "breakeven_months": "raqam",
  "risks": [{ "risk": "tumanga xos aniq xavf", "mitigation": "aniq yechim" }],
  "mentor_note": "1-2 jumlada eng muhim amaliy maslahat — qayerdan boshlash kerak"
}`;

  return { system, user };
}
