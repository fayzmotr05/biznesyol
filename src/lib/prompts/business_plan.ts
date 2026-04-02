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
    ru: `Ты — опытный бизнес-консультант в Узбекистане с 15+ лет опыта. Даёшь ТОЛЬКО практичные, конкретные советы.

ПРАВИЛА:
1. Бизнес-план СТРОГО по выбранной сфере. Шитьё = только шитьё.
2. В startup_costs ОБЯЗАТЕЛЬНО укажи ВСЁ что нужно купить:
   - Оборудование: конкретная модель, где купить (OLX.uz, Малика, Сергели базар), цена в млн сум
   - Расходные материалы: ткань/продукты/запчасти на первый месяц
   - Аренда: примерная цена в этом районе
   - Регистрация: ИП через my.gov.uz, стоимость
   Пример: "Швейная машина JUKI DDL-8700 (б/у, OLX.uz)" — 3.5 млн
3. Если пользователь ответил что у него НЕТ оборудования — подробно распиши что именно нужно купить и где.
4. Используй "ориентировочно", "по оценке". Без гарантий.
5. Ответ — строго JSON без markdown, без \`\`\`.`,

    uz: `Sen — O'zbekistonda 15+ yillik tajribaga ega biznes-maslahatchi. FAQAT amaliy, aniq maslahatlar berasan.

QOIDALAR:
1. Biznes-reja FAQAT tanlangan soha bo'yicha. Tikuvchilik = faqat tikuvchilik.
2. startup_costs da sotib olish kerak bo'lgan HAMMA narsani yoz:
   - Jihozlar: aniq model, qayerdan olish (OLX.uz, Malika, Sergeli bozori), narxi mln so'mda
   - Xom ashyo: mato/oziq-ovqat/ehtiyot qismlar birinchi oyga
   - Ijara: shu tumandagi taxminiy narx
   - Ro'yxatdan o'tish: my.gov.uz orqali YaTT, narxi
   Masalan: "Tikuv mashinasi JUKI DDL-8700 (b/u, OLX.uz)" — 3.5 mln
3. Agar foydalanuvchi jihozi YO'Q degan bo'lsa — nimani, qayerdan, qancha so'mga olish kerakligini BATAFSIL yoz.
4. "Taxminan", "baholash bo'yicha" so'zlarini ishlat. Kafolat berma.
5. Javob — faqat JSON, markdown bo'lmasin, \`\`\` bo'lmasin.`,

    en: `You are an experienced business consultant in Uzbekistan with 15+ years of experience. Give ONLY practical, specific advice.

RULES:
1. Business plan MUST match the chosen field. Sewing = only sewing.
2. In startup_costs list EVERYTHING the user needs to buy:
   - Equipment: specific model, where to buy (OLX.uz, Malika bazaar, Sergeli), price in mln UZS
   - Supplies: fabric/ingredients/parts for first month
   - Rent: approximate price in this district
   - Registration: IP via my.gov.uz, cost
   Example: "JUKI DDL-8700 sewing machine (used, OLX.uz)" — 3.5 mln
3. If user answered they DON'T have equipment — detail exactly what to buy, where, and for how much.
4. Use "approximately", "estimated". No guarantees.
5. Response — strict JSON only, no markdown, no \`\`\`.`,
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
Ko'nikmalari: ${skillsList || "soha bo'yicha (yuqoridagi javoblarga qarang)"}
Boshlang'ich kapital: ${answers.capital || "noma'lum"} mln so'm
Garov: ${answers.collateral || "noma'lum"}
Raqobat yaqin atrofda: ${answers.competition || "noma'lum"}
Kam ta'minlangan oila: ${answers.poor_registry || "noma'lum"}
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
