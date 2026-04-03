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
  requires_guarantor: boolean;
}

async function getAsakaLoans(answers: SurveyAnswers, sphere: string): Promise<string> {
  const birthYear = parseInt((answers.user_birth_year as string) || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 30;
  const gender = (answers.user_gender_actual as string) || "";
  const isPoorRegistry = (answers.poor_registry as string) === "yes";

  const supabase = createAdminClient();
  const { data } = await supabase.from("bank_products").select("*").eq("is_active", true);
  if (!data || data.length === 0) return "Bank mahsulotlari topilmadi.";

  const results: string[] = [];

  for (const l of data as BankProduct[]) {
    const issues: string[] = [];
    let eligible = true;

    // Age check
    if (age < l.age_min || age > l.age_max) {
      eligible = false;
      issues.push(`Yosh mos emas (${l.age_min}-${l.age_max} yosh talab qilinadi)`);
    }

    // Target audience check
    if (l.target === "youth" && age > 30) {
      eligible = false;
      issues.push("Faqat 30 yoshgacha yoshlar uchun");
    }
    if (l.target === "large_business" || l.target === "salary_clients") continue;
    if (l.target === "women" && gender !== "female") {
      eligible = false;
      issues.push("Faqat ayollar uchun");
    }

    // Sphere check
    if (!l.suitable_for_spheres.includes("any") && !l.suitable_for_spheres.includes(sphere)) {
      eligible = false;
      issues.push(`Bu soha uchun mos emas (mos sohalar: ${l.suitable_for_spheres.join(", ")})`);
    }

    // Collateral check
    if (l.requires_collateral) {
      issues.push("GAROV TALAB QILINADI: " + l.collateral_type);
    }

    if (l.requires_guarantor) {
      issues.push("Kafil talab qilinadi");
    }

    const status = eligible ? "MOS" : "MOS EMAS";
    let line = `• [${status}] ${l.name_uz}: ${l.min_amount_mln}-${l.max_amount_mln} mln so'm, ${l.interest_rate_percent}, ${l.term_months_max} oygacha`;
    if (l.grace_period_months) line += `, ${l.grace_period_months} oy imtiyozli davr`;
    if (l.requires_collateral) line += `. Garov: ${l.collateral_type}`;
    else line += `. Garovsiz`;
    if (l.who_can_get_uz) line += `\n  Kim olishi mumkin: ${l.who_can_get_uz}`;
    if (l.special_conditions_uz) line += `\n  Maxsus shart: ${l.special_conditions_uz}`;
    if (issues.length > 0 && !eligible) line += `\n  SABAB: ${issues.join("; ")}`;

    results.push(line);
  }

  if (results.length === 0) return "Mos kredit topilmadi.";
  return results.join("\n\n");
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
    if (key.startsWith(`${sphere}_q`) || key.startsWith("other_q")) sphereAnswers.push(`${key}: ${val}`);
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
4. Foydalanuvchi javoblariga qarab TAYYOR YECHIM ber — savol berma.
5. Xom ashyo va materiallarni QAYERDAN olish mumkinligini tuman kontekstida yoz.

DAROMAD HISOBLASH QOIDALARI — JUDA MUHIM:
6. Oylik daromadni REAL BOZOR NARXLARIDA hisobla. Web search ishlatib O'zbekistondagi HAQIQIY narxlarni top.
7. MINIMAL emas, REAL ishlaydigan biznesning daromadini ko'rsat. Masalan:
   - Tikuvchi: kuniga 2-3 ta buyurtma × 150 000-300 000 so'm = oyiga 8-15 mln so'm daromad
   - Oshpaz: kuniga 20-30 porsiya × 25 000-40 000 so'm = oyiga 15-25 mln so'm daromad
   - Go'zallik saloni: kuniga 3-5 mijoz × 100 000-200 000 so'm = oyiga 10-20 mln so'm daromad
   - Avto ta'mir: kuniga 2-3 mijoz × 200 000-500 000 so'm = oyiga 12-25 mln so'm daromad
8. Daromadni KUNLIK MIJOZLAR × NARX × 25 ISH KUNI formulasi bilan hisobla.
9. Xarajatlarni ham REAL ko'rsat (ijara, xom ashyo, elektr, soliq, transport).
10. SOF FOYDA = daromad - xarajatlar. Agar foyda 2 mln dan kam chiqsa — hisoblashni qayta ko'rib chiq, chunki bu real emas.

KREDIT TANLASH QOIDALARI — JUDA MUHIM:
11. Quyidagi kredit ro'yxatida [MOS] va [MOS EMAS] belgilangan. FAQAT [MOS] deb belgilangan kreditlardan tanla!
12. Agar kredit GAROV talab qilsa — foydalanuvchiga ogohlantir va garovsiz alternativa ko'rsat.
13. Foydalanuvchining yoshi, jinsi va sohasiga mos kelmaydigan kreditni TAVSIYA QILMA.
14. "Kim olishi mumkin" qismini diqqat bilan o'qi — agar foydalanuvchi shartlarga mos kelmasa, boshqa kredit tanla.

15. "Taxminan", "baholash bo'yicha" so'zlarini ishlat — kafolat berma.
${unemployedFamily > 0 ? `16. Oilada ${unemployedFamily} ta ishsiz a'zo bor — ularni biznesga jalb qilish haqida maslahat ber.` : ""}

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
  "recommended_loan": {"name": "Asakabank kredit nomi", "amount": "kredit summasi so'mda", "rate": "foiz stavka", "term": "muddat", "why": "nega aynan bu kredit mos — foydalanuvchi shartlarga qanday mos kelishini tushuntir"},
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
Ijtimoiy yordam dasturida: ${(answers.poor_registry as string) || "?"}

ASAKABANK KREDIT MAHSULOTLARI:
${asakaLoans}

MUHIM:
1. Web search ishlatib, jihozlar va materiallarning HAQIQIY narxlarini O'zbekiston bozoridan top.
2. Daromadni REAL hisobla: kunlik mijozlar soni × xizmat narxi × 25 ish kuni. Web search bilan O'zbekistondagi haqiqiy xizmat narxlarini tekshir.
3. FAQAT [MOS] deb belgilangan kreditlarni tavsiya qil. [MOS EMAS] kreditlarni TAVSIYA QILMA.`;

  return { system, user };
}
