import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { District, SurveyAnswers } from "@/types";
import districtsData from "../../../../data/districts.json";

const districts = districtsData as District[];

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

    const lang = (answers.lang as string) || "uz";
    const sphere = (answers.sphere as string) || "";
    const freeText = (answers.free_text as string) || "";
    const exactCapital = (answers.exact_capital as string) || "";
    const collateral = (answers.collateral as string) || "";
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
      if (d.population) lines.push(`Aholi: ${(d.population as number).toLocaleString()}`);
      if (d.unemployment_rate) lines.push(`Ishsizlik: ${d.unemployment_rate}%`);
      if (d.small_businesses_count) lines.push(`Kichik bizneslar: ${d.small_businesses_count}`);
      if (d.individual_entrepreneurs) lines.push(`YaTT: ${d.individual_entrepreneurs}`);
      if (d.key_sectors) lines.push(`Asosiy sohalar: ${(d.key_sectors as string[]).join(", ")}`);
      if (d.recommended_sectors) lines.push(`Tavsiya sohalar: ${(d.recommended_sectors as string[]).join(", ")}`);
      if (d.markets_count) lines.push(`Bozorlar: ${d.markets_count}`);
      if (d.notes) lines.push(`Qo'shimcha: ${d.notes}`);
      districtContext = lines.join("\n");
    }

    const systemPrompt = lang === "uz"
      ? `Sen — O'zbekistonda 15+ yillik tajribaga ega biznes-maslahatchi.

VAZIFANG: Foydalanuvchi haqidagi barcha ma'lumotlarni tahlil qilib, unga 3-4 ta ANIQ, REAL biznes g'oyasini tavsiya qil.

QOIDALAR:
- Har bir g'oya foydalanuvchining ANIQ vaziyatiga mos bo'lsin (puli, jihozlari, joyi, tumani)
- Agar foydalanuvchi yozgan narsa to'liq amalga oshirib bo'lmasa (masalan, mashina yo'q lekin tashish xizmati xohlaydi) — o'xshash lekin amalga oshiriladigan variant taklif qil
- Agar pul yetmasa — kamroq pul talab qiladigan variant ham taklif qil
- Har bir g'oyada: nomi, qisqa tavsifi, taxminiy boshlang'ich xarajat (mln so'm), oylik daromad kutish
- Tuman ma'lumotlarini hisobga ol (aholi, bozorlar, raqobat)

Javob — FAQAT JSON, markdown bo'lmasin:
{
  "ideas": [
    {
      "title": "g'oya nomi",
      "description": "2-3 jumla — nima qiladi, kimga xizmat, nega aynan bu",
      "estimated_startup_mln": raqam,
      "estimated_monthly_income_mln": raqam,
      "why_suitable": "nega aynan bu odamga mos",
      "key_requirement": "eng muhim narsa kerak (masalan: haydovchilik guvohnomasi)"
    }
  ]
}`
      : lang === "ru"
      ? `Ты — опытный бизнес-консультант в Узбекистане (15+ лет).

ЗАДАЧА: Проанализируй все данные о пользователе и предложи 3-4 КОНКРЕТНЫХ, РЕАЛЬНЫХ бизнес-идеи.

ПРАВИЛА:
- Каждая идея соответствует КОНКРЕТНОЙ ситуации пользователя (деньги, оборудование, район)
- Если то что хочет пользователь невозможно (нет машины но хочет перевозки) — предложи похожий но реализуемый вариант
- Если денег не хватает — предложи вариант подешевле
- Каждая идея: название, описание, стартовые расходы, ожидаемый доход
- Учитывай данные района

Ответ — ТОЛЬКО JSON:
{
  "ideas": [
    {
      "title": "название",
      "description": "2-3 предложения",
      "estimated_startup_mln": число,
      "estimated_monthly_income_mln": число,
      "why_suitable": "почему подходит",
      "key_requirement": "главное что нужно"
    }
  ]
}`
      : `You are an experienced business consultant in Uzbekistan (15+ years).

TASK: Analyze all user data and suggest 3-4 SPECIFIC, REALISTIC business ideas.

RULES:
- Each idea must match the user's SPECIFIC situation (money, equipment, location)
- If what user wants isn't possible (no car but wants transport) — suggest similar but feasible alternative
- If not enough money — suggest cheaper alternative too
- Each idea: title, description, startup cost, expected income
- Use district data

Response — JSON ONLY:
{
  "ideas": [
    {
      "title": "idea name",
      "description": "2-3 sentences",
      "estimated_startup_mln": number,
      "estimated_monthly_income_mln": number,
      "why_suitable": "why it fits this person",
      "key_requirement": "main thing needed"
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
Garov: ${collateral || "?"}
Kam ta'minlangan: ${poorRegistry || "?"}

3-4 ta ANIQ biznes g'oyasini tavsiya qil. Agar foydalanuvchi yozgan narsa amalga oshirib bo'lmasa — o'xshash lekin real variantni taklif qil. Kamida 1 ta arzon variant bo'lsin.`;

    // Call Claude
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return Response.json({ error: "AI response parsing failed" }, { status: 500 });
    }

    const ideas = JSON.parse(text.slice(start, end + 1));
    return Response.json(ideas);
  } catch (err) {
    console.error("generate-ideas error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
