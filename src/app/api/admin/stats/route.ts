import { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = verifyAdminToken(token);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const districtFilter = admin.role === "district_admin" ? admin.district_id : req.nextUrl.searchParams.get("districtId");

  let query = supabase.from("survey_sessions").select("*");
  if (districtFilter) query = query.eq("district_id", districtFilter);
  const { data: sessions } = await query;

  if (!sessions) return Response.json({ stats: null });

  const total = sessions.length;
  const completed = sessions.filter((s) => s.completed).length;
  const businessPath = sessions.filter((s) => s.path === "business").length;
  const jobPath = sessions.filter((s) => s.path === "job").length;

  // Count answers by sphere
  const sphereCounts: Record<string, number> = {};
  for (const s of sessions) {
    const answers = s.answers as Record<string, unknown>;
    const sphere = answers?.sphere as string;
    if (sphere) sphereCounts[sphere] = (sphereCounts[sphere] || 0) + 1;
  }

  // Age distribution
  const ageCounts: Record<string, number> = {};
  for (const s of sessions) {
    const answers = s.answers as Record<string, unknown>;
    const age = answers?.age_group as string;
    if (age) ageCounts[age] = (ageCounts[age] || 0) + 1;
  }

  // Gender
  const genderCounts: Record<string, number> = {};
  for (const s of sessions) {
    const answers = s.answers as Record<string, unknown>;
    const g = answers?.gender as string;
    if (g) genderCounts[g] = (genderCounts[g] || 0) + 1;
  }

  // User profiles count
  let profileQuery = supabase.from("user_profiles").select("id", { count: "exact", head: true });
  if (districtFilter) profileQuery = profileQuery.eq("district_id", districtFilter);
  const { count: profilesCount } = await profileQuery;

  // Progress tracking
  let progressQuery = supabase.from("progress_tracking").select("step");
  if (districtFilter) {
    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length > 0) progressQuery = progressQuery.in("session_id", sessionIds);
  }
  const { data: progressData } = await progressQuery;

  const stepCounts: Record<string, number> = {};
  for (const p of progressData || []) {
    stepCounts[p.step] = (stepCounts[p.step] || 0) + 1;
  }

  return Response.json({
    stats: {
      total_sessions: total,
      completed_sessions: completed,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      business_path: businessPath,
      job_path: jobPath,
      registered_users: profilesCount || 0,
      top_spheres: Object.entries(sphereCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      age_distribution: ageCounts,
      gender_distribution: genderCounts,
      progress_steps: stepCounts,
    },
  });
}
