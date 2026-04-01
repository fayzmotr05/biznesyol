import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, birthYear, gender, districtId, education, familySize, monthlyIncomeMln, employmentStatus, hasBusinessExperience, sessionId } = body;

    if (!fullName || !phone || !districtId) {
      return Response.json({ error: "Name, phone, and district are required" }, { status: 400 });
    }

    // Validate phone format (Uzbekistan: +998XXXXXXXXX)
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean.length < 9) {
      return Response.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        session_id: sessionId || null,
        full_name: fullName.trim(),
        phone: phoneClean,
        birth_year: birthYear || null,
        gender: gender || null,
        district_id: districtId,
        education: education || null,
        family_size: familySize || null,
        monthly_income_mln: monthlyIncomeMln || null,
        employment_status: employmentStatus || null,
        has_business_experience: hasBusinessExperience || false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("user profile insert error:", error);
      return Response.json({ error: "Failed to save profile" }, { status: 500 });
    }

    return Response.json({ id: data.id });
  } catch (err) {
    console.error("users route error:", err);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
