import { NextRequest } from "next/server";
import { getAdminByEmail, verifyPassword, createAdminToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const admin = await getAdminByEmail(email);
    if (!admin || !verifyPassword(password, admin.password_hash)) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update last login
    const supabase = createAdminClient();
    await supabase.from("admins").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id);

    const token = createAdminToken({
      id: admin.id,
      role: admin.role,
      district_id: admin.district_id,
    });

    return Response.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        district_id: admin.district_id,
      },
    });
  } catch (err) {
    console.error("admin login error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
