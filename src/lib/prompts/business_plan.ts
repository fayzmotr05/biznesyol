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
    ru: `Ты — опытный бизнес-консультант по малому бизнесу в Узбекистане.

Правила:
- Отвечай ТОЛЬКО на русском языке.
- Будь практичным и конкретным. Без воды и мотивационных речей.
- Все суммы в узбекских сумах (млн сум).
- ОБЯЗАТЕЛЬНО используй "ориентировочно", "возможно", "по оценке" — не давай гарантий.
- Учитывай реальную статистику района если она предоставлена.
- Анализируй конкурентную среду на основе данных района.
- Ответ — строго JSON без markdown.`,

    uz: `Sen — O'zbekistonda kichik biznes bo'yicha tajribali biznes-maslahatchi.

Qoidalar:
- FAQAT o'zbek tilida javob ber (lotin alifbosi).
- Amaliy va aniq bo'l. Suv quyma.
- Barcha summalarni o'zbek so'mida (mln so'm) ko'rsat.
- ALBATTA "taxminan", "ehtimol", "baholash bo'yicha" so'zlarini ishlat — kafolat berma.
- Tuman statistikasi berilgan bo'lsa, uni tahlil qil.
- Raqobat muhitini tuman ma'lumotlari asosida baholash.
- Javob — faqat JSON, markdown bo'lmasin.`,

    en: `You are an experienced small business consultant in Uzbekistan.

Rules:
- Answer ONLY in English.
- Be practical and specific. No fluff or motivational speeches.
- All amounts in Uzbek som (mln UZS).
- ALWAYS use "approximately", "possibly", "estimated" — never guarantee outcomes.
- Analyze the district statistics if provided.
- Assess competition based on real district data.
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

  const user = `Biznes-reja tuzib ber:

Tuman: ${district.name_uz} (${district.region_uz}), turi: ${district.type}, aholi: ${district.population.toLocaleString()}
${districtContext}
${userBlock}

TANLANGAN SOHA: ${sphere}
Biznes turi: ${biz.name_uz} (${biz.category})
Ko'nikmalari: ${skillsList}
Boshlang'ich kapital: ${answers.capital} mln so'm
Garov: ${answers.collateral}
Joy: ${answers.premises || "noma'lum"}
Raqobat: ${answers.competition}
Kam ta'minlangan: ${answers.poor_registry}
${sphereAnswers.length > 0 ? "\nSOHA BO'YICHA JAVOBLAR:\n" + sphereAnswers.join("\n") : ""}

Score: ${business.total_score} (ko'nikmalar: ${business.breakdown.skills_match}, kapital: ${business.breakdown.capital_sufficient}, raqobat: ${business.breakdown.competition_low})

Tavsiya etilgan bank: ${bp.bank_name_uz} — ${bp.product_name_uz}
Kredit: ${bp.min_amount_mln}–${bp.max_amount_mln} mln so'm, ${bp.interest_rate_annual}% yillik, ${bp.term_months_max} oygacha
Bank tanlash sabablari: ${bank.match_reasons.join("; ")}

O'rtacha daromad: ${biz.avg_monthly_revenue_mln} mln/oy
O'rtacha xarajat: ${biz.avg_monthly_expense_mln} mln/oy
Qoplash muddati: ~${biz.breakeven_months} oy

Faqat JSON qaytar:
{
  "summary": "biznes g'oyasining aniq tavsifi, tuman kontekstida (3-4 jumla)",
  "target_audience": "bu tumandagi aniq maqsadli auditoriya",
  "startup_costs": [{ "item": "xarajat nomi", "amount_mln": raqam }],
  "monthly_forecast": { "revenue_mln": raqam, "expenses_mln": raqam, "profit_mln": raqam },
  "breakeven_months": raqam,
  "risks": [{ "risk": "aniq xavf tavsifi", "mitigation": "qanday kamaytirish" }],
  "mentor_note": "tuman va soha uchun amaliy maslahat"
}`;

  return { system, user };
}
