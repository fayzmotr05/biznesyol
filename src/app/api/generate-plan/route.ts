import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/anthropic";
import { buildBusinessPlanPrompt } from "@/lib/prompts/business_plan";
import { scoreBusinessTypes, selectBankProducts } from "@/lib/scoring";
import type { District, SurveyAnswers } from "@/types";
import districtsData from "../../../../data/districts.json";

const districts = districtsData as District[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, businessId, bankId } = body as {
      sessionId: string;
      businessId: string;
      bankId: string;
    };

    if (!sessionId || !businessId || !bankId) {
      return Response.json(
        { error: "sessionId, businessId, and bankId are required" },
        { status: 400 }
      );
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

    // Load district data from admin panel (if available)
    const { data: districtData } = await supabase
      .from("district_data")
      .select("*")
      .eq("district_id", session.district_id)
      .maybeSingle();

    // Score businesses
    const scored = scoreBusinessTypes(answers, district.type);
    const business = scored.find((s) => s.business_type_id === businessId);
    if (!business) {
      return Response.json({ error: "Business type not in recommendations" }, { status: 404 });
    }

    // Select banks
    const bankMatches = selectBankProducts(answers, businessId, district.type);
    const bank = bankMatches.find((b) => b.bank_product.id === bankId);
    if (!bank) {
      return Response.json({ error: "Bank product not eligible" }, { status: 404 });
    }

    // Build prompt — now with district data from admin panel
    const { system, user } = buildBusinessPlanPrompt({
      business,
      bank,
      answers,
      district,
      districtData,
    });

    // Stream response from Claude
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
  } catch (err) {
    console.error("generate-plan error:", err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
