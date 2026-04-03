import type { SurveyAnswers, ScoredBusiness, BankMatch, District } from "@/types";
import { createAdminClient } from "@/lib/supabase/admin";

interface DistrictDataRow { [key: string]: unknown; }
interface BuildPromptParams {
  business: ScoredBusiness; bank: BankMatch; answers: SurveyAnswers;
  district: District; districtData?: DistrictDataRow | null;
}

interface BankProduct {
  id: string; name_uz: string; min_amount_mln: number; max_amount_mln: number;
  interest_rate_percent: string; interest_rate_number: number; term_months_max: number;
  grace_period_months: number; collateral_type: string; requires_collateral: boolean;
  who_can_get_uz: string; special_conditions_uz: string; target: string;
  age_min: number; age_max: number; suitable_for_spheres: string[];
}

async function getAsakaLoans(answers: SurveyAnswers, sphere: string): Promise<string> {
  const birthYear = parseInt((answers.user_birth_year as string) || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 30;

  const supabase = createAdminClient();
  const { data } = await supabase.from("bank_products").select("*").eq("is_active", true);
  if (!data || data.length === 0) return "Bank mahsulotlari topilmadi.";

  const matching = (data as BankProduct[]).filter((l) => {
    if (age < l.age_min || age > l.age_max) return false;
    if (l.target === "youth" && age > 30) return false;
    if (l.target === "large_business" || l.target === "salary_clients") return false;
    if (!l.suitable_for_spheres.includes("any") && !l.suitable_for_spheres.includes(sphere)) return false;
    return true;
  });

  if (matching.length === 0) return "Mos kredit topilmadi.";

  return matching.map((l) =>
    `• ${l.name_uz}: ${l.min_amount_mln * 1000000}-${l.max_amount_mln * 1000000} so'm, ${l.interest_rate_percent}, ${l.term_months_max} oygacha` +
    (l.grace_period_months ? `, ${l.grace_period_months} oy imtiyozli davr` : "") +
    `. Garov: ${l.collateral_type}. ${l.special_conditions_uz}`
  ).join("\n");
}

export async function buildBusinessPlanPrompt(params: BuildPromptParams): Promise<{ system: string; user: string }> {
  const { business, answers, district, districtData } = params;
  const lang = (answers.lang as string) || "uz";
  const biz = business.business_type;
  const sphere = (answers.sphere as string) || "";

  // District context
  let districtContext = "";
  if (districtData) {
    const d = districtData;
    const lines: string[] = [];
    if (d.population) lines.push(`Aholi: ${(d.population as number).toLocaleString()}`);
    if (d.unemployment_rate) lines.push(`Ishsizlik: ${d.unemployment_rate}%`);
    if (d.small_businesses_count) lines.push(`Kichik bizneslar: ${d.small_businesses_count}`);
    if (d.individual_entrepreneurs) lines.push(`YaTT: ${d.individual_entrepreneurs}`);
    if (d.sme_loans_bln) lines.push(`KBga kreditlar: ${d.sme_loans_bln} mlrd so'm`);
    if (d.markets_count) lines.push(`Bozorlar: ${d.markets_count}`);
    if (d.key_sectors) lines.push(`Sohalar: ${(d.key_sectors as string[]).join(", ")}`);
    if (d.recommended_sectors) lines.push(`Tavsiya: ${(d.recommended_sectors as string[]).join(", ")}`);
    if (d.notes) lines.push((d.notes as string));
    districtContext = lines.join("\n");
  }

  // Sphere answers
  const sphereAnswers: string[] = [];
  for (const [key, val] of Object.entries(answers)) {
    if (key.startsWith(`${sphere}_q`)) sphereAnswers.push(`${key}: ${val}`);
  }

  // User
  const birthYear = parseInt((answers.user_birth_year as string) || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 0;
  const unemployedFamily = parseInt((answers.user_unemployed_family as string) || "0");
  const exactCapital = (answers.exact_capital as string) || "noma'lum";

  const asakaLoans = await getAsakaLoans(answers, sphere);

  const langMap: Record<string, { systemLang: string; currency: string }> = {
    uz: { systemLang: "o'zbek tilida (lotin alifbosi)", currency: "so'm" },
    ru: { systemLang: "на русском языке", currency: "сум" },
    en: { systemLang: "in English", currency: "UZS" },
  };
  const { systemLang, currency } = langMap[lang] || langMap.uz;

  const system = `Sen Asakabankning professional biznes-maslahatchisisan.

VAZIFANG: Foydalanuvchining barcha ma'lumotlarini tahlil qilib, PROFESSIONAL biznes-reja yoz.

MUHIM QOIDALAR:
1. Javob FAQAT ${systemLang} bo'lsin.
2. Barcha summalar ODDIY RAQAMDA yoz: "3 500 000 ${currency}" — MILLION deb yozma.
3. Tovarlar va jihozlar narxlarini REAL bozor narxlarida ko'rsat. Web search ishlatib, OLX.uz, olcha.uz dan haqiqiy narxlarni top.
4. Foydalanuvchi javoblariga qarab TAYYOR YECHIM ber — savol berma. Masalan: agar tikuv mashinasi yo'q degan bo'lsa, "siz Sergeli bozoridan JACK A2S mashinasini 3 500 000 so'mga olishingiz mumkin" deb yoz.
5. Xom ashyo va materiallarni QAYERDAN olish mumkinligini tuman kontekstida yoz (masalan: "Kattaqo'rg'on bozoridan" yoki "Samarqand Siyob bozoridan").
6. Asakabank kredit mahsulotlaridan ENG MOS birini tanla va NEGA mos ekanini tushuntir.
7. "Taxminan", "baholash bo'yicha" so'zlarini ishlat — kafolat berma.
${unemployedFamily > 0 ? `8. Oilada ${unemployedFamily} ta ishsiz a'zo bor — ularni biznesga jalb qilish haqida maslahat ber.` : ""}

JAVOB FORMATI — faqat JSON, markdown bo'lmasin:
{
  "business_name": "biznes nomi",
  "summary": "3-4 jumla: nima qiladi, kimga xizmat ko'rsatadi, qancha daromad kutilmoqda",
  "why_this_business": "nega aynan bu biznes bu odamga bu tumanda mos keladi",
  "startup_items": [
    {"item": "jihoz/tovar nomi va modeli", "price": "aniq narx so'mda", "where_to_buy": "qayerdan olish mumkin"}
  ],
  "monthly_plan": {"revenue": "oylik daromad so'mda", "expenses": "oylik xarajat so'mda", "profit": "sof foyda so'mda"},
  "total_startup_cost": "jami boshlang'ich xarajat so'mda",
  "loan_needed": "kredit kerak bo'lgan summa so'mda (jami xarajat - foydalanuvchi puli)",
  "breakeven_months": raqam,
  "recommended_loan": {"name": "Asakabank kredit nomi", "amount": "kredit summasi so'mda", "rate": "foiz stavka", "term": "muddat", "why": "nega aynan bu kredit mos"},
  "first_steps": ["1-qadam", "2-qadam", "3-qadam", "4-qadam", "5-qadam"],
  "risks": [{"risk": "xavf", "solution": "yechim"}],
  "tip": "eng muhim amaliy maslahat"
}`;

  const user = `FOYDALANUVCHI:
Ism: ${answers.user_name || "?"}, Yosh: ${age || "?"}, Jins: ${(answers.user_gender_actual as string) === "female" ? "ayol" : "erkak"}
Ta'lim: ${(answers.user_education as string) || "?"}, Holati: ${(answers.user_employment as string) || "?"}
Biznes tajribasi: ${(answers.user_experience as string) === "yes" ? "bor" : "yo'q"}
${unemployedFamily > 0 ? `Oiladagi ishsizlar: ${unemployedFamily} kishi` : ""}

TUMAN: ${district.name_uz} (${district.region_uz}), ${district.type}, aholi: ${district.population.toLocaleString()}
${districtContext ? "TUMAN STATISTIKASI:\n" + districtContext : ""}

BIZNES: ${biz.name_uz} (soha: ${sphere})
${sphereAnswers.length > 0 ? "SOHA JAVOBLARI:\n" + sphereAnswers.join("\n") : ""}

MOLIYA:
Mavjud pul: ${exactCapital !== "skip" && exactCapital !== "noma'lum" ? exactCapital + " mln so'm" : "aniq ko'rsatilmagan"}
Raqobat: ${(answers.competition as string) || "?"}
Kam ta'minlangan: ${(answers.poor_registry as string) || "?"}

ASAKABANK KREDIT MAHSULOTLARI (foydalanuvchiga mos):
${asakaLoans}

MUHIM: Web search ishlatib, jihozlar va materiallarning HAQIQIY narxlarini O'zbekiston bozoridan top. OLX.uz, olcha.uz, mahalliy bozorlardan real narxlarni ko'rsat.`;

  return { system, user };
}
