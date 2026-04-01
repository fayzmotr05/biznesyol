import { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — get district data
export async function GET(req: NextRequest) {
  const districtId = req.nextUrl.searchParams.get("districtId");
  if (!districtId) return Response.json({ error: "districtId required" }, { status: 400 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("district_data")
    .select("*")
    .eq("district_id", districtId)
    .maybeSingle();

  return Response.json({ data: data || null });
}

// POST — upsert district data (district_admin for own district, super_admin for any)
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = verifyAdminToken(token);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { districtId, ...fields } = body;

    if (!districtId) return Response.json({ error: "districtId required" }, { status: 400 });

    // District admin can only edit their own district
    if (admin.role === "district_admin" && admin.district_id !== districtId) {
      return Response.json({ error: "Forbidden — not your district" }, { status: 403 });
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("district_data")
      .select("id")
      .eq("district_id", districtId)
      .maybeSingle();

    const record = {
      district_id: districtId,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
      ...fields,
    };

    if (existing) {
      const { error } = await supabase
        .from("district_data")
        .update(record)
        .eq("district_id", districtId);
      if (error) return Response.json({ error: "Update failed" }, { status: 500 });
    } else {
      const { error } = await supabase.from("district_data").insert(record);
      if (error) return Response.json({ error: "Insert failed" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("district-data error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
