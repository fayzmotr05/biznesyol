import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lang, district_id, path, answers } = body;

    if (!district_id || !path || !answers) {
      return Response.json(
        { error: "district_id, path, and answers are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("survey_sessions")
      .insert({
        lang: lang || "ru",
        district_id,
        path,
        answers,
        completed: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("survey insert error:", error);
      return Response.json({ error: "Failed to save session" }, { status: 500 });
    }

    return Response.json({ id: data.id });
  } catch (err) {
    console.error("survey route error:", err);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
