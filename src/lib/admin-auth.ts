import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "biznesyol-admin-2026";

// Simple token: base64(JSON({id, role, district_id, exp}))
export function createAdminToken(admin: { id: string; role: string; district_id: string | null }): string {
  const payload = {
    id: admin.id,
    role: admin.role,
    district_id: admin.district_id,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64") + "." + simpleSign(payload);
}

export function verifyAdminToken(token: string): { id: string; role: string; district_id: string | null } | null {
  try {
    const [payloadB64, sig] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString());
    if (payload.exp < Date.now()) return null;
    if (sig !== simpleSign(payload)) return null;
    return { id: payload.id, role: payload.role, district_id: payload.district_id };
  } catch {
    return null;
  }
}

function simpleSign(payload: Record<string, unknown>): string {
  const data = JSON.stringify(payload) + ADMIN_SECRET;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Hash password (simple for MVP — use bcrypt in production)
export function hashPassword(password: string): string {
  const data = password + ADMIN_SECRET;
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash) + data.charCodeAt(i);
    hash |= 0;
  }
  return "h1$" + Math.abs(hash).toString(36);
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function getAdminByEmail(email: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .single();
  return data;
}
