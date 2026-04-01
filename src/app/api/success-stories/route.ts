import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, districtId, businessTypeId, storyRu, storyUz } =
      await req.json();

    if (!sessionId || !districtId || !businessTypeId) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("success_stories").insert({
      district_id: districtId,
      business_type_id: businessTypeId,
      story_ru: storyRu || "",
      story_uz: storyUz || "",
      verified: false,
    });

    if (error) {
      console.error("story insert error:", error);
      return Response.json({ error: "Failed to save" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("success-stories route error:", err);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
