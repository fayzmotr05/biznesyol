"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { District } from "@/types";
import districtsData from "../../../../data/districts.json";

const districts = districtsData as District[];

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  district_id: string | null;
  is_active: boolean;
  role: string;
  last_login_at: string | null;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // New admin form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    const d = localStorage.getItem("admin_data");
    if (!t || !d) { router.push("/admin/login"); return; }
    const admin = JSON.parse(d);
    if (admin.role !== "super_admin") { router.push("/admin/login"); return; }
    setToken(t);
    fetchAdmins(t);
  }, [router]);

  async function fetchAdmins(t: string) {
    const res = await fetch("/api/admin/admins", { headers: { Authorization: `Bearer ${t}` } });
    const data = await res.json();
    setAdmins(data.admins || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMsg("");

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, password, fullName, districtId }),
    });
    const data = await res.json();
    setCreating(false);

    if (res.ok) {
      setMsg(`${fullName} yaratildi`);
      setEmail(""); setPassword(""); setFullName(""); setDistrictId("");
      fetchAdmins(token);
    } else {
      setMsg(`Xato: ${data.error}`);
    }
  }

  const filteredDistricts = search
    ? districts.filter((d) => d.name_uz.toLowerCase().includes(search.toLowerCase()) || d.name_ru.toLowerCase().includes(search.toLowerCase()))
    : districts;

  function districtName(id: string): string {
    const d = districts.find((d) => d.id === id);
    return d ? d.name_uz : id;
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Super Admin</h1>
          <p className="text-sm text-muted">Tuman adminlarini boshqarish</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_data"); router.push("/admin/login"); }}
          className="text-sm text-muted hover:text-foreground"
        >
          Chiqish
        </button>
      </div>

      {/* Create new admin */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-semibold mb-4">Yangi tuman admin yaratish</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="To'liq ism" required
            className="px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
          />
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" required
            className="px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Parol" required minLength={6}
            className="px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
          />
          <div className="relative">
            <input
              type="text" value={search} onChange={(e) => { setSearch(e.target.value); setDistrictId(""); }}
              placeholder={districtId ? districtName(districtId) : "Tuman tanlang..."}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
            />
            {search && !districtId && (
              <div className="absolute z-10 top-full mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredDistricts.slice(0, 20).map((d) => (
                  <button
                    key={d.id} type="button"
                    onClick={() => { setDistrictId(d.id); setSearch(d.name_uz); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-primary-light"
                  >
                    {d.name_uz} <span className="text-muted">({d.region_uz})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sm:col-span-2 flex items-center gap-4">
            <button
              type="submit" disabled={creating || !districtId}
              className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-40"
            >
              {creating ? "Yaratilmoqda..." : "Admin yaratish"}
            </button>
            {msg && <span className="text-sm text-muted">{msg}</span>}
          </div>
        </form>
      </div>

      {/* Admin list */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Adminlar ro&#39;yxati ({admins.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {admins.map((a) => (
            <div key={a.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.full_name}</div>
                <div className="text-sm text-muted">{a.email}</div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  a.role === "super_admin" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                }`}>
                  {a.role === "super_admin" ? "Super" : districtName(a.district_id || "")}
                </span>
                {a.last_login_at && (
                  <div className="text-xs text-muted mt-1">
                    Oxirgi kirish: {new Date(a.last_login_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          {admins.length === 0 && (
            <div className="px-6 py-8 text-center text-muted">Hali admin yo&#39;q</div>
          )}
        </div>
      </div>
    </main>
  );
}
