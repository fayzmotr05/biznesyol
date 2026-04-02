import type { SurveyAnswers, ScoredBusiness, BankMatch, District } from "@/types";
import asakaBankData from "../../../data/asaka_bank.json";

interface DistrictDataRow {
  [key: string]: unknown;
}

interface BuildPromptParams {
  business: ScoredBusiness;
  bank: BankMatch;
  answers: SurveyAnswers;
  district: District;
  districtData?: DistrictDataRow | null;
}

function getAsakaLoans(answers: SurveyAnswers, sphere: string): string {
  const birthYear = parseInt((answers.user_birth_year as string) || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 30;
  const hasCollateral = (answers.collateral as string) === "есть";

  const matching = asakaBankData.filter((loan) => {
    if (age < loan.age_min || age > loan.age_max) return false;
    if (loan.requires_collateral && !hasCollateral) return false;
    if (loan.target === "youth" && age > 30) return false;
    if (!loan.suitable_for.includes("any") && !loan.suitable_for.includes(sphere)) return false;
    return true;
  });

  if (matching.length === 0) return "Mos Asakabank kredit mahsuloti topilmadi.";

  return matching.map((l) =>
    `- ${l.name_uz}: ${l.min_amount_mln}-${l.max_amount_mln} mln, ${l.interest_rate}% yillik, ${l.term_months_max} oygacha` +
    (l.grace_period_months ? `, ${l.grace_period_months} oy imtiyozli` : "") +
    (l.requires_collateral ? " (garov kerak)" : " (garovsiz)") +
    ` — ${l.description_uz}`
  ).join("\n");
}

export function buildBusinessPlanPrompt(params: BuildPromptParams): {
  system: string;
  user: string;
} {
  const { business, bank, answers, district, districtData } = params;
  const lang = (answers.lang as string) || "uz";
  const biz = business.business_type;
  const bp = bank.bank_product;
  const sphere = (answers.sphere as string) || "";

  // District context
  let districtContext = "";
  if (districtData) {
    const d = districtData;
    const lines: string[] = [];
    if (d.population) lines.push(`Aholi: ${(d.population as number).toLocaleString()}`);
    if (d.unemployment_rate) lines.push(`Ishsizlik: ${d.unemployment_rate}%`);
    if (d.poverty_rate) lines.push(`Kambagrlik: ${d.poverty_rate}%`);
    if (d.small_businesses_count) lines.push(`Kichik bizneslar: ${d.small_businesses_count}`);
    if (d.individual_entrepreneurs) lines.push(`YaTT: ${d.individual_entrepreneurs}`);
    if (d.sme_loans_bln) lines.push(`KBga kreditlar: ${d.sme_loans_bln} mlrd`);
    if (d.markets_count) lines.push(`Bozorlar: ${d.markets_count}`);
    if (d.key_sectors) lines.push(`Asosiy sohalar: ${(d.key_sectors as string[]).join(", ")}`);
    if (d.recommended_sectors) lines.push(`Tavsiya sohalar: ${(d.recommended_sectors as string[]).join(", ")}`);
    if (d.notes) lines.push(`Izoh: ${d.notes}`);
    districtContext = lines.join("\n");
  }

  // Sphere-specific answers
  const sphereAnswers: string[] = [];
  for (const [key, val] of Object.entries(answers)) {
    if (key.startsWith(`${sphere}_q`)) {
      sphereAnswers.push(`${key}: ${val}`);
    }
  }

  // User profile
  const birthYear = parseInt((answers.user_birth_year as string) || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 0;
  const unemployedFamily = parseInt((answers.user_unemployed_family as string) || "0");

  // Asaka bank matching loans
  const asakaLoans = getAsakaLoans(answers, sphere);

  const system = lang === "ru"
    ? `Ты — бизнес-консультант Асакабанка в Узбекистане. Пишешь бизнес-планы для реальных клиентов.

ФОРМАТ ОТВЕТА — строго JSON, без markdown:
{
  "business_name": "название бизнеса",
  "summary": "3-4 предложения: что делает, для кого, сколько зарабатывает",
  "why_this_business": "почему именно этот бизнес подходит этому человеку в этом районе",
  "startup_items": [
    {"item": "КОНКРЕТНОЕ оборудование/товар с моделью", "price_mln": число, "where_to_buy": "где купить"}
  ],
  "monthly_plan": {"revenue_mln": число, "expenses_mln": число, "profit_mln": число},
  "breakeven_months": число,
  "recommended_loan": {"name": "название кредита Асакабанка", "amount_mln": число, "rate": "ставка", "why": "почему этот"},
  "first_steps": ["шаг 1", "шаг 2", "шаг 3", "шаг 4", "шаг 5"],
  "risks": [{"risk": "риск", "solution": "решение"}],
  "tip": "один практичный совет"
}`
    : lang === "en"
    ? `You are a business consultant at Asakabank in Uzbekistan. You write business plans for real clients.

RESPONSE FORMAT — strict JSON, no markdown:
{
  "business_name": "business name",
  "summary": "3-4 sentences: what it does, for whom, how much it earns",
  "why_this_business": "why this business fits this person in this district",
  "startup_items": [
    {"item": "SPECIFIC equipment/goods with model", "price_mln": number, "where_to_buy": "where to buy"}
  ],
  "monthly_plan": {"revenue_mln": number, "expenses_mln": number, "profit_mln": number},
  "breakeven_months": number,
  "recommended_loan": {"name": "Asakabank loan name", "amount_mln": number, "rate": "rate", "why": "why this one"},
  "first_steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "risks": [{"risk": "risk", "solution": "solution"}],
  "tip": "one practical tip"
}`
    : `Sen — Asakabankning biznes-maslahatchisisan. Haqiqiy mijozlar uchun biznes-reja yozasan.

JAVOB FORMATI — faqat JSON, markdown bo'lmasin:
{
  "business_name": "biznes nomi",
  "summary": "3-4 jumla: nima qiladi, kimga, qancha daromad",
  "why_this_business": "nega aynan shu biznes shu odamga shu tumanda mos",
  "startup_items": [
    {"item": "ANIQ jihoz/tovar nomi va modeli", "price_mln": raqam, "where_to_buy": "qayerdan olish"}
  ],
  "monthly_plan": {"revenue_mln": raqam, "expenses_mln": raqam, "profit_mln": raqam},
  "breakeven_months": raqam,
  "recommended_loan": {"name": "Asakabank kredit nomi", "amount_mln": raqam, "rate": "stavka", "why": "nega aynan bu"},
  "first_steps": ["1-qadam", "2-qadam", "3-qadam", "4-qadam", "5-qadam"],
  "risks": [{"risk": "xavf", "solution": "yechim"}],
  "tip": "bitta amaliy maslahat"
}`;

  const user = `FOYDALANUVCHI:
Ism: ${answers.user_name || "?"}, Yosh: ${age || "?"}, Jins: ${(answers.user_gender_actual as string) || "?"}
Ta'lim: ${(answers.user_education as string) || "?"}, Holati: ${(answers.user_employment as string) || "?"}
Biznes tajribasi: ${(answers.user_experience as string) === "yes" ? "bor" : "yo'q"}
Oiladagi ishsizlar: ${unemployedFamily > 0 ? unemployedFamily + " kishi (ularni ham jalb qilish mumkin)" : "0"}

TUMAN: ${district.name_uz} (${district.region_uz}), ${district.type}, aholi: ${district.population.toLocaleString()}
${districtContext ? "TUMAN STATISTIKASI:\n" + districtContext : "Ma'lumot kiritilmagan"}

TANLANGAN BIZNES: ${biz.name_uz}
SOHA: ${sphere}
${sphereAnswers.length > 0 ? "SOHA JAVOBLARI:\n" + sphereAnswers.join("\n") : ""}

MOLIYA:
Mavjud pul: ${(answers.exact_capital as string) || "noma'lum"} mln so'm
Garov: ${(answers.collateral as string) || "noma'lum"}
Raqobat: ${(answers.competition as string) || "noma'lum"}
Kam ta'minlangan: ${(answers.poor_registry as string) || "noma'lum"}

ASAKABANK KREDIT MAHSULOTLARI (shu foydalanuvchiga mos):
${asakaLoans}

BANK TAVSIYASI (umumiy):
${bp.bank_name_uz} — ${bp.product_name_uz}
${bp.min_amount_mln}-${bp.max_amount_mln} mln, ${bp.interest_rate_annual}% yillik

MUHIM: startup_items da HAMMA kerakli narsani yoz — jihozlar, xom ashyo, ijara, ro'yxatdan o'tish. Har bir narsa uchun aniq narx va qayerdan olishni ko'rsat.
recommended_loan da AYNAN Asakabank mahsulotlaridan birini tanlash va nega shu mos ekanini tushuntir.
${unemployedFamily > 0 ? `tip da oiladagi ${unemployedFamily} ishsiz a'zoni ham biznesga jalb qilish haqida maslahat ber.` : ""}`;

  return { system, user };
}
