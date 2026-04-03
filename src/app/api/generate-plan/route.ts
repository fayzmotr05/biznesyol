import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseAIJson } from "@/lib/json-repair";
import { buildBusinessPlanPrompt } from "@/lib/prompts/business_plan";
import type { District, SurveyAnswers, BusinessType } from "@/types";
import districtsData from "../../../../data/districts.json";
import businessTypesData from "../../../../data/business_types.json";

const districts = districtsData as District[];
const businessTypes = businessTypesData as BusinessType[];

interface IdeaInput {
  title: string;
  description: string;
  estimated_startup_mln?: number | string;
  estimated_monthly_income_mln?: number | string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, businessId, idea } = body as {
      sessionId: string;
      businessId?: string;
      idea?: IdeaInput;
    };

    if (!sessionId || (!businessId && !idea)) {
      return Response.json(
        { error: "sessionId and either businessId or idea are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: session, error: sessionError } = await supabase
      .from("survey_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    if (sessionError || !session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const answers = session.answers as SurveyAnswers;
    const district = districts.find((d) => d.id === session.district_id);
    if (!district)
      return Response.json({ error: "District not found" }, { status: 404 });

    const { data: districtData } = await supabase
      .from("district_data")
      .select("*")
      .eq("district_id", session.district_id)
      .maybeSingle();

    // Resolve business type — either from static list or from AI idea
    let bizType: BusinessType | undefined;
    let ideaContext = "";

    if (businessId) {
      bizType = businessTypes.find((b) => b.id === businessId);
      if (!bizType)
        return Response.json(
          { error: "Unknown business type" },
          { status: 404 }
        );
    } else if (idea) {
      // Create a synthetic business type from the AI idea
      ideaContext = `\n\nTANLANGAN G'OYA: ${idea.title}\nTavsif: ${idea.description}`;
      if (idea.estimated_startup_mln) {
        ideaContext += `\nTaxminiy boshlang'ich xarajat: ${idea.estimated_startup_mln} mln so'm`;
      }
      if (idea.estimated_monthly_income_mln) {
        ideaContext += `\nTaxminiy oylik foyda: ${idea.estimated_monthly_income_mln} mln so'm`;
      }
      const startupNum = parseFloat(String(idea.estimated_startup_mln)) || 5;
      const incomeNum = parseFloat(String(idea.estimated_monthly_income_mln)) || 5;
      // Use a default business type shell for the prompt builder
      bizType = {
        id: "ai_idea",
        name_ru: idea.title,
        name_uz: idea.title,
        category: "services",
        required_skills: [],
        optional_skills: [],
        min_capital_mln: startupNum,
        max_capital_mln: startupNum * 2,
        requires_collateral: false,
        location_types: ["urban", "mixed", "rural"],
        seasons: { spring: 1, summer: 1, autumn: 1, winter: 1 },
        risk_level: "medium",
        avg_monthly_revenue_mln: incomeNum,
        avg_monthly_expense_mln: incomeNum * 0.6,
        breakeven_months: 6,
        requires_premises: false,
        target_clients: "",
        govt_support: false,
        description_ru: idea.description,
        checklist_steps: [],
      };
    }

    if (!bizType) {
      return Response.json({ error: "No business type resolved" }, { status: 400 });
    }

    const business = {
      business_type_id: bizType.id,
      business_type: bizType,
      total_score: 0.7,
      breakdown: {
        skills_match: 0.7,
        capital_sufficient: 0.7,
        competition_low: 0.5,
        risk_acceptable: 0.7,
        season_fit: 1.0,
      },
      rank: 1,
    };

    // Bank matching is handled inside buildBusinessPlanPrompt via Supabase
    const bank = {
      bank_product: {
        id: "none",
        bank_name_ru: "",
        bank_name_uz: "Aniqlanmadi",
        product_name_ru: "",
        product_name_uz: "Bankka murojaat qiling",
        logo_emoji: "",
        website: "https://asakabank.uz",
        min_amount_mln: 5,
        max_amount_mln: 100,
        interest_rate_annual: 22,
        term_months_max: 36,
        requires_collateral: false,
        requires_guarantor: false,
        target_audience: [],
        location_restriction: [],
        age_min: 18,
        age_max: 60,
        gender: "any" as const,
        processing_days: 7,
        approval_rate: "medium" as const,
        digital_application: false,
        notes_ru: "",
        notes_uz: "",
        conditions: [],
        suitable_for_businesses: [],
      },
      match_reasons: [],
      disqualifiers: [],
      is_eligible: true,
      priority: 0,
    };

    const { system, user } = await buildBusinessPlanPrompt({
      business,
      bank,
      answers,
      district,
      districtData,
    });

    // For AI ideas: replace the generic BIZNES line with the specific idea
    let finalUser = user;
    if (idea && ideaContext) {
      // Remove the generic "BIZNES: ..." line and replace with specific idea context
      finalUser = user.replace(
        /BIZNES:.*\n/,
        `BIZNES: ${idea.title}\nTavsif: ${idea.description}\n`
      );
      if (idea.estimated_startup_mln) {
        finalUser += `\nTaxminiy boshlang'ich xarajat: ${idea.estimated_startup_mln} mln so'm`;
      }
      if (idea.estimated_monthly_income_mln) {
        finalUser += `\nTaxminiy oylik foyda: ${idea.estimated_monthly_income_mln} mln so'm`;
      }
      finalUser += `\n\nMUHIM: Biznes-reja FAQAT "${idea.title}" uchun bo'lsin. Boshqa biznes turini taklif qilma.`;
    }

    // Call Claude with WEB SEARCH enabled for real prices
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 4000,
      system,
      tools: [
        {
          type: "web_search_20250305" as const,
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [{ role: "user", content: finalUser }],
    });

    // Extract text from response (may include tool use blocks)
    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    // Parse JSON from AI response
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
    console.error("generate-plan error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
