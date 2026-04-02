import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBusinessPlanPrompt } from "@/lib/prompts/business_plan";
import { selectBankProducts } from "@/lib/scoring";
import type { District, SurveyAnswers, BusinessType } from "@/types";
import districtsData from "../../../../data/districts.json";
import businessTypesData from "../../../../data/business_types.json";

const districts = districtsData as District[];
const businessTypes = businessTypesData as BusinessType[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, businessId } = body as {
      sessionId: string;
      businessId: string;
      bankId?: string;
    };

    if (!sessionId || !businessId) {
      return Response.json({ error: "sessionId and businessId are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Load session
    const { data: session, error: sessionError } = await supabase
      .from("survey_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return Response.json({ error: "Session not found: " + (sessionError?.message || "no data") }, { status: 404 });
    }

    const answers = session.answers as SurveyAnswers;

    // Find district
    const district = districts.find((d) => d.id === session.district_id);
    if (!district) {
      return Response.json({ error: "District not found: " + session.district_id }, { status: 404 });
    }

    // Load district data from admin panel
    const { data: districtData } = await supabase
      .from("district_data")
      .select("*")
      .eq("district_id", session.district_id)
      .maybeSingle();

    // Find business type
    const bizType = businessTypes.find((b) => b.id === businessId);
    if (!bizType) {
      return Response.json({ error: "Unknown business type: " + businessId }, { status: 404 });
    }

    const business = {
      business_type_id: bizType.id,
      business_type: bizType,
      total_score: 0.7,
      breakdown: { skills_match: 0.7, capital_sufficient: 0.7, competition_low: 0.5, risk_acceptable: 0.7, season_fit: 1.0 },
      rank: 1,
    };

    // Find best matching bank
    const bankMatches = selectBankProducts(answers, businessId, district.type);
    const bank = bankMatches[0] || {
      bank_product: {
        id: "none", bank_name_ru: "Не определён", bank_name_uz: "Aniqlanmadi",
        product_name_ru: "Обратитесь в банк", product_name_uz: "Bankka murojaat qiling",
        logo_emoji: "🏦", website: "https://cbu.uz",
        min_amount_mln: 5, max_amount_mln: 100, interest_rate_annual: 22,
        term_months_max: 36, requires_collateral: false, requires_guarantor: false,
        target_audience: [], location_restriction: [], age_min: 18, age_max: 60,
        gender: "any" as const, processing_days: 7, approval_rate: "medium" as const,
        digital_application: false, notes_ru: "", notes_uz: "", conditions: [],
        suitable_for_businesses: [],
      },
      match_reasons: [], disqualifiers: [], is_eligible: true, priority: 0,
    };

    // Build prompt
    const { system, user } = buildBusinessPlanPrompt({
      business, bank, answers, district, districtData,
    });

    // Import Anthropic dynamically to catch API key errors
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const stream = anthropic.messages.stream({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(JSON.stringify({ error: errMsg })));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("generate-plan error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
