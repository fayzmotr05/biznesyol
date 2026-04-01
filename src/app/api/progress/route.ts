import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — load all completed steps for a session
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json({ error: "sessionId required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("progress_tracking")
    .select("step, completed_at")
    .eq("session_id", sessionId)
    .order("completed_at", { ascending: true });

  if (error) {
    return Response.json({ error: "Failed to load progress" }, { status: 500 });
  }

  return Response.json({ steps: data });
}

// POST — mark a step as completed
export async function POST(req: NextRequest) {
  try {
    const { sessionId, step } = await req.json();
    if (!sessionId || !step) {
      return Response.json({ error: "sessionId and step required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert — don't duplicate
    const { data: existing } = await supabase
      .from("progress_tracking")
      .select("id")
      .eq("session_id", sessionId)
      .eq("step", step)
      .maybeSingle();

    if (existing) {
      return Response.json({ ok: true, alreadyExists: true });
    }

    const { error } = await supabase.from("progress_tracking").insert({
      session_id: sessionId,
      step,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("progress insert error:", error);
      return Response.json({ error: "Failed to save" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("progress route error:", err);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
