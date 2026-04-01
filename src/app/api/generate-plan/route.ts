import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/anthropic";
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
    const { sessionId, businessId, bankId } = body as {
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
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const answers = session.answers as SurveyAnswers;

    // Find district
    const district = districts.find((d) => d.id === session.district_id);
    if (!district) {
      return Response.json({ error: "District not found" }, { status: 404 });
    }

    // Load district data from admin panel
    const { data: districtData } = await supabase
      .from("district_data")
      .select("*")
      .eq("district_id", session.district_id)
      .maybeSingle();

    // Find the business type directly — don't restrict to top-5
    const bizType = businessTypes.find((b) => b.id === businessId);
    if (!bizType) {
      return Response.json({ error: "Unknown business type" }, { status: 404 });
    }

    // Build a ScoredBusiness object for the prompt
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

    // Find best matching bank — use provided bankId or pick the best one
    const bankMatches = selectBankProducts(answers, businessId, district.type);
    let bank = bankMatches[0]; // default to best match
    if (bankId) {
      const specific = bankMatches.find((b) => b.bank_product.id === bankId);
      if (specific) bank = specific;
    }

    // If no bank matches at all, create a minimal placeholder
    if (!bank && bankMatches.length === 0) {
      // Generate plan without bank recommendation
      const { system, user } = buildBusinessPlanPrompt({
        business,
        bank: {
          bank_product: {
            id: "none",
            bank_name_ru: "Не определён",
            bank_name_uz: "Aniqlanmadi",
            product_name_ru: "Рекомендуем обратиться в банк",
            product_name_uz: "Bankka murojaat qilishni tavsiya etamiz",
            logo_emoji: "🏦",
            website: "https://cbu.uz",
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
            gender: "any",
            processing_days: 7,
            approval_rate: "medium",
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
        },
        answers,
        district,
        districtData,
      });

      return streamClaude(system, user);
    }

    const { system, user } = buildBusinessPlanPrompt({
      business,
      bank,
      answers,
      district,
      districtData,
    });

    return streamClaude(system, user);
  } catch (err) {
    console.error("generate-plan error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function streamClaude(system: string, user: string) {
  const stream = anthropic.messages.stream({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 1500,
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
        controller.error(err);
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
}
