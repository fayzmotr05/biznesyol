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

    // Load session from Supabase
    const supabase = createAdminClient();
    const { data: session, error: sessionError } = await supabase
      .from("survey_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return Response.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const answers = session.answers as SurveyAnswers;

    // Find district
    const district = districts.find((d) => d.id === session.district_id);
    if (!district) {
      return Response.json(
        { error: "District not found" },
        { status: 404 }
      );
    }

    // Score businesses and find the requested one
    const scored = scoreBusinessTypes(answers, district.type);
    const business = scored.find((s) => s.business_type_id === businessId);
    if (!business) {
      return Response.json(
        { error: "Business type not in recommendations" },
        { status: 404 }
      );
    }

    // Select banks and find the requested one
    const bankMatches = selectBankProducts(answers, businessId, district.type);
    const bank = bankMatches.find((b) => b.bank_product.id === bankId);
    if (!bank) {
      return Response.json(
        { error: "Bank product not eligible" },
        { status: 404 }
      );
    }

    // Build prompt
    const { system, user } = buildBusinessPlanPrompt({
      business,
      bank,
      answers,
      district,
    });

    // Stream response from Claude
    const stream = anthropic.messages.stream({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250514",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });

    // Convert Anthropic SDK stream to web ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
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
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
