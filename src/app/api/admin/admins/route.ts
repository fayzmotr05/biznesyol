import { NextRequest } from "next/server";
import { verifyAdminToken, hashPassword } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — list all district admins (super_admin only)
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = verifyAdminToken(token);
  if (!admin || admin.role !== "super_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id, email, full_name, role, district_id, is_active, created_at, last_login_at")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: "Failed to fetch" }, { status: 500 });
  return Response.json({ admins: data });
}

// POST — create new district admin (super_admin only)
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = verifyAdminToken(token);
  if (!admin || admin.role !== "super_admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, password, fullName, districtId } = await req.json();
    if (!email || !password || !fullName || !districtId) {
      return Response.json({ error: "All fields required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check duplicate
    const { data: existing } = await supabase.from("admins").select("id").eq("email", email).maybeSingle();
    if (existing) return Response.json({ error: "Email already exists" }, { status: 409 });

    const { data, error } = await supabase
      .from("admins")
      .insert({
        email,
        password_hash: hashPassword(password),
        full_name: fullName,
        role: "district_admin",
        district_id: districtId,
      })
      .select("id, email, full_name, district_id")
      .single();

    if (error) {
      console.error("create admin error:", error);
      return Response.json({ error: "Failed to create" }, { status: 500 });
    }

    return Response.json({ admin: data });
  } catch (err) {
    console.error("admin create error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
