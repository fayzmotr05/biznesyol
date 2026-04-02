import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBusinessPlanPrompt } from "@/lib/prompts/business_plan";
import type { District, SurveyAnswers, BusinessType } from "@/types";
import districtsData from "../../../../data/districts.json";
import businessTypesData from "../../../../data/business_types.json";

const districts = districtsData as District[];
const businessTypes = businessTypesData as BusinessType[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, businessId } = body as { sessionId: string; businessId: string };

    if (!sessionId || !businessId) {
      return Response.json({ error: "sessionId and businessId are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: session, error: sessionError } = await supabase
      .from("survey_sessions").select("*").eq("id", sessionId).single();
    if (sessionError || !session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const answers = session.answers as SurveyAnswers;
    const district = districts.find((d) => d.id === session.district_id);
    if (!district) return Response.json({ error: "District not found" }, { status: 404 });

    const { data: districtData } = await supabase
      .from("district_data").select("*").eq("district_id", session.district_id).maybeSingle();

    const bizType = businessTypes.find((b) => b.id === businessId);
    if (!bizType) return Response.json({ error: "Unknown business type" }, { status: 404 });

    const business = {
      business_type_id: bizType.id, business_type: bizType,
      total_score: 0.7, breakdown: { skills_match: 0.7, capital_sufficient: 0.7, competition_low: 0.5, risk_acceptable: 0.7, season_fit: 1.0 },
      rank: 1,
    };

    // Get any matching bank
    const { selectBankProducts } = await import("@/lib/scoring");
    const bankMatches = selectBankProducts(answers, businessId, district.type);
    const bank = bankMatches[0] || {
      bank_product: { id: "none", bank_name_ru: "", bank_name_uz: "Aniqlanmadi", product_name_ru: "", product_name_uz: "Bankka murojaat qiling", logo_emoji: "🏦", website: "https://asakabank.uz", min_amount_mln: 5, max_amount_mln: 100, interest_rate_annual: 22, term_months_max: 36, requires_collateral: false, requires_guarantor: false, target_audience: [], location_restriction: [], age_min: 18, age_max: 60, gender: "any" as const, processing_days: 7, approval_rate: "medium" as const, digital_application: false, notes_ru: "", notes_uz: "", conditions: [], suitable_for_businesses: [] },
      match_reasons: [], disqualifiers: [], is_eligible: true, priority: 0,
    };

    const { system, user } = await buildBusinessPlanPrompt({ business, bank, answers, district, districtData });

    // Call Claude with WEB SEARCH enabled for real prices
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: 4000,
      system,
      tools: [{ type: "web_search_20250305" as const, name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: user }],
    });

    // Extract text from response (may include tool use blocks)
    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    // Clean and return JSON
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return Response.json({ error: "AI response has no JSON" }, { status: 500 });
    }

    const jsonStr = clean.slice(start, end + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      return Response.json(parsed);
    } catch {
      return Response.json({ error: "Invalid JSON from AI" }, { status: 500 });
    }
  } catch (err) {
    console.error("generate-plan error:", err);
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
