import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseAIJson } from "@/lib/json-repair";
import type { District, SurveyAnswers } from "@/types";
import districtsData from "../../../../data/districts.json";

export const maxDuration = 60;

const districts = districtsData as District[];

interface BankProduct {
  id: string;
  name_uz: string;
  min_amount_mln: number;
  max_amount_mln: number;
  interest_rate_percent: string;
  interest_rate_number: number;
  term_months_max: number;
  grace_period_months: number;
  collateral_type: string;
  requires_collateral: boolean;
  who_can_get_uz: string;
  special_conditions_uz: string;
  target: string;
  age_min: number;
  age_max: number;
  suitable_for_spheres: string[];
}

async function getMatchingLoans(
  answers: SurveyAnswers,
  sphere: string
): Promise<string> {
  const birthYear = parseInt((answers.user_birth_year as string) || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 30;
  const poorRegistry = (answers.poor_registry as string) || "";

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bank_products")
    .select("*")
    .eq("is_active", true);
  if (!data || data.length === 0) return "";

  const matching = (data as BankProduct[]).filter((l) => {
    if (age < l.age_min || age > l.age_max) return false;
    if (l.target === "youth" && age > 30) return false;
    if (l.target === "large_business" || l.target === "salary_clients")
      return false;
    if (
      !l.suitable_for_spheres.includes("any") &&
      !l.suitable_for_spheres.includes(sphere)
    )
      return false;
    return true;
  });

  if (matching.length === 0) return "";

  return matching
    .map(
      (l) =>
        `• ${l.name_uz}: ${l.min_amount_mln}-${l.max_amount_mln} mln so'm, ${l.interest_rate_percent}, ${l.term_months_max} oygacha` +
        (l.grace_period_months
          ? `, ${l.grace_period_months} oy imtiyozli davr`
          : "") +
        (l.requires_collateral ? ` (garov kerak: ${l.collateral_type})` : " (garovsiz)") +
        (l.special_conditions_uz ? `. ${l.special_conditions_uz}` : "")
    )
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: session } = await supabase
      .from("survey_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const answers = session.answers as SurveyAnswers;
    const district = districts.find((d) => d.id === session.district_id);

    // Load district admin data
    const { data: districtData } = await supabase
      .from("district_data")
      .select("*")
      .eq("district_id", session.district_id)
      .maybeSingle();

    const sphere = (answers.sphere as string) || "";
    const freeText = (answers.free_text as string) || "";
    const exactCapital = (answers.exact_capital as string) || "";
    const poorRegistry = (answers.poor_registry as string) || "";

    // Gather sphere-specific answers
    const sphereAnswers: string[] = [];
    for (const [key, val] of Object.entries(answers)) {
      if (key.startsWith(`${sphere}_q`)) {
        sphereAnswers.push(`${key}: ${val}`);
      }
    }

    // User profile
    const userName = (answers.user_name as string) || "";
    const userGender = (answers.user_gender_actual as string) || "";
    const userEducation = (answers.user_education as string) || "";
    const userIncome = (answers.user_income as string) || "";
    const userEmployment = (answers.user_employment as string) || "";
    const userExperience = (answers.user_experience as string) || "";
    const birthYear = parseInt((answers.user_birth_year as string) || "0");
    const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 0;

    // District context
    let districtContext = "";
    if (districtData) {
      const d = districtData as Record<string, unknown>;
      const lines: string[] = [];
      if (d.population)
        lines.push(`Aholi: ${(d.population as number).toLocaleString()}`);
      if (d.unemployment_rate)
        lines.push(`Ishsizlik: ${d.unemployment_rate}%`);
      if (d.small_businesses_count)
        lines.push(`Kichik bizneslar: ${d.small_businesses_count}`);
      if (d.individual_entrepreneurs)
        lines.push(`YaTT: ${d.individual_entrepreneurs}`);
      if (d.key_sectors)
        lines.push(
          `Asosiy sohalar: ${(d.key_sectors as string[]).join(", ")}`
        );
      if (d.recommended_sectors)
        lines.push(
          `Tavsiya sohalar: ${(d.recommended_sectors as string[]).join(", ")}`
        );
      if (d.markets_count) lines.push(`Bozorlar: ${d.markets_count}`);
      if (d.notes) lines.push(`Qo'shimcha: ${d.notes}`);
      districtContext = lines.join("\n");
    }

    // Fetch matching bank products
    const bankLoans = await getMatchingLoans(answers, sphere);

    const systemPrompt = `Sen — O'zbekistonda 15+ yillik tajribaga ega biznes-maslahatchi. Asakabank bilan hamkorlikda ishlaydigan platforma uchun maslahat berasan.

VAZIFANG: Foydalanuvchi haqidagi barcha ma'lumotlarni VA mavjud bank kreditlarini tahlil qilib, unga 3-4 ta ANIQ, REAL biznes g'oyasini tavsiya qil.

QOIDALAR:
- Har bir g'oya foydalanuvchining ANIQ vaziyatiga mos bo'lsin (puli, jihozlari, joyi, tumani)
- MUHIM: Foydalanuvchining O'Z PULI + KREDIT IMKONIYATINI birga hisobla. Masalan: 5 mln puli bor + 50 mln garovsiz kredit olishi mumkin = 55 mln bilan biznes boshlashi mumkin
- Agar foydalanuvchi yozgan narsa to'liq amalga oshirib bo'lmasa — o'xshash lekin amalga oshiriladigan variant taklif qil
- Agar pul yetmasa — kamroq pul talab qiladigan variant ham taklif qil
- Har bir g'oyada qaysi kredit mos kelishini ko'rsat
- Tuman ma'lumotlarini hisobga ol (aholi, bozorlar, raqobat)

DAROMAD QOIDASI — JUDA MUHIM:
- Oylik daromadni REAL BOZOR narxlarida hisobla: kunlik mijozlar × narx × 25 ish kuni
- MINIMUM oylik sof foyda 4 mln so'mdan kam bo'lmasin — aks holda biznes qilishning ma'nosi yo'q
- Real misollar: tikuvchi 5-12 mln, oshpaz 8-20 mln, go'zallik 6-15 mln, savdo 5-15 mln, ta'mirlash 7-20 mln
- estimated_monthly_income_mln — bu SOF FOYDA (daromad minus xarajatlar), MINIMUM 4 mln

Javob — FAQAT JSON, markdown bo'lmasin:
{
  "ideas": [
    {
      "title": "g'oya nomi",
      "description": "2-3 jumla — nima qiladi, kimga xizmat, nega aynan bu",
      "estimated_startup_mln": raqam,
      "estimated_monthly_income_mln": "MIN-MAX oraliq, masalan: 5-12 (mln so'mda, sof foyda)",
      "why_suitable": "nega aynan bu odamga mos",
      "key_requirement": "eng muhim narsa kerak",
      "suggested_loan": "qaysi Asakabank krediti mos (nomi va summasi) yoki 'kredit shart emas' agar o'z puli yetsa"
    }
  ]
}`;

    const userPrompt = `FOYDALANUVCHI:
Ism: ${userName}, Yosh: ${age || "?"}, Jins: ${userGender || "?"}
Ta'lim: ${userEducation || "?"}, Holati: ${userEmployment || "?"}
Biznes tajribasi: ${userExperience === "yes" ? "bor" : "yo'q"}
Hozirgi daromadi: ${userIncome || "?"} mln/oy

TUMAN: ${district?.name_uz || "?"} (${district?.region_uz || "?"}), ${district?.type || "?"}, aholi: ${district?.population?.toLocaleString() || "?"}
${districtContext ? "TUMAN STATISTIKASI:\n" + districtContext : ""}

TANLANGAN SOHA: ${sphere}
FOYDALANUVCHI YOZGAN: "${freeText || "aniq yozmagan"}"

SOHA BO'YICHA JAVOBLAR:
${sphereAnswers.length > 0 ? sphereAnswers.join("\n") : "javoblar yo'q"}

MOLIYAVIY HOLAT:
Mavjud pul: ${exactCapital || "?"} mln so'm
Kam ta'minlangan: ${poorRegistry || "?"}

ASAKABANK KREDIT MAHSULOTLARI (foydalanuvchiga mos):
${bankLoans || "Mos kredit topilmadi"}

VAZIFA: 3-4 ta ANIQ biznes g'oyasini tavsiya qil. Har bir g'oyada kredit imkoniyatini hisobga ol — foydalanuvchining O'Z PULI + KREDIT yig'indisi bilan nima qila olishini ko'rsat. Kamida 1 ta arzon variant bo'lsin (kredit shart emas).`;

    // Call Claude
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = parseAIJson(text);
    if (!parsed) {
      console.error("AI JSON parse failed. Raw:", text.slice(0, 500));
      return Response.json(
        { error: "AI javobini o'qib bo'lmadi. Qayta urinib ko'ring." },
        { status: 500 }
      );
    }
    return Response.json(parsed);
  } catch (err) {
    console.error("generate-ideas error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
