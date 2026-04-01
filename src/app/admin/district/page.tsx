"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { District } from "@/types";
import districtsData from "../../../../data/districts.json";

const districts = districtsData as District[];

interface DistrictDataForm {
  population: string; families_count: string; mahallas_count: string;
  labor_force: string; employed_count: string; unemployed_count: string;
  unemployment_rate: string; poverty_rate: string; poverty_families: string;
  migrants_abroad: string; vacant_jobs: string;
  small_businesses_count: string; individual_entrepreneurs: string;
  foreign_companies: string; sme_loans_bln: string;
  key_sectors: string; industrial_zones: string; markets_count: string;
  export_volume_mln_usd: string;
  schools_count: string; kindergartens_count: string; kindergarten_coverage_pct: string;
  hospitals_count: string; roads_km: string;
  electricity_pct: string; gas_pct: string; water_pct: string; road_quality_pct: string;
  recommended_sectors: string; development_priorities: string; notes: string;
}

const emptyForm: DistrictDataForm = {
  population: "", families_count: "", mahallas_count: "",
  labor_force: "", employed_count: "", unemployed_count: "",
  unemployment_rate: "", poverty_rate: "", poverty_families: "",
  migrants_abroad: "", vacant_jobs: "",
  small_businesses_count: "", individual_entrepreneurs: "",
  foreign_companies: "", sme_loans_bln: "",
  key_sectors: "", industrial_zones: "", markets_count: "",
  export_volume_mln_usd: "",
  schools_count: "", kindergartens_count: "", kindergarten_coverage_pct: "",
  hospitals_count: "", roads_km: "",
  electricity_pct: "", gas_pct: "", water_pct: "", road_quality_pct: "",
  recommended_sectors: "", development_priorities: "", notes: "",
};

interface Stats {
  total_sessions: number; completed_sessions: number; completion_rate: number;
  business_path: number; job_path: number; registered_users: number;
  top_spheres: [string, number][]; age_distribution: Record<string, number>;
  gender_distribution: Record<string, number>; progress_steps: Record<string, number>;
}

export default function DistrictAdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState<{ full_name: string; district_id: string; role: string } | null>(null);
  const [tab, setTab] = useState<"data" | "stats">("stats");
  const [form, setForm] = useState<DistrictDataForm>(emptyForm);
  const [stats, setStats] = useState<Stats | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    const d = localStorage.getItem("admin_data");
    if (!t || !d) { router.push("/admin/login"); return; }
    const a = JSON.parse(d);
    setToken(t);
    setAdmin(a);
    loadDistrictData(a.district_id);
    loadStats(t);
  }, [router]);

  async function loadDistrictData(districtId: string) {
    const res = await fetch(`/api/admin/district-data?districtId=${districtId}`);
    const { data } = await res.json();
    if (data) {
      setForm({
        population: data.population?.toString() || "",
        families_count: data.families_count?.toString() || "",
        mahallas_count: data.mahallas_count?.toString() || "",
        labor_force: data.labor_force?.toString() || "",
        employed_count: data.employed_count?.toString() || "",
        unemployed_count: data.unemployed_count?.toString() || "",
        unemployment_rate: data.unemployment_rate?.toString() || "",
        poverty_rate: data.poverty_rate?.toString() || "",
        poverty_families: data.poverty_families?.toString() || "",
        migrants_abroad: data.migrants_abroad?.toString() || "",
        vacant_jobs: data.vacant_jobs?.toString() || "",
        small_businesses_count: data.small_businesses_count?.toString() || "",
        individual_entrepreneurs: data.individual_entrepreneurs?.toString() || "",
        foreign_companies: data.foreign_companies?.toString() || "",
        sme_loans_bln: data.sme_loans_bln?.toString() || "",
        key_sectors: (data.key_sectors || []).join(", "),
        industrial_zones: data.industrial_zones?.toString() || "",
        markets_count: data.markets_count?.toString() || "",
        export_volume_mln_usd: data.export_volume_mln_usd?.toString() || "",
        schools_count: data.schools_count?.toString() || "",
        kindergartens_count: data.kindergartens_count?.toString() || "",
        kindergarten_coverage_pct: data.kindergarten_coverage_pct?.toString() || "",
        hospitals_count: data.hospitals_count?.toString() || "",
        roads_km: data.roads_km?.toString() || "",
        electricity_pct: data.electricity_pct?.toString() || "",
        gas_pct: data.gas_pct?.toString() || "",
        water_pct: data.water_pct?.toString() || "",
        road_quality_pct: data.road_quality_pct?.toString() || "",
        recommended_sectors: (data.recommended_sectors || []).join(", "),
        development_priorities: (data.development_priorities || []).join(", "),
        notes: data.notes || "",
      });
    }
    setLoading(false);
  }

  async function loadStats(t: string) {
    const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${t}` } });
    const data = await res.json();
    setStats(data.stats);
  }

  async function handleSave() {
    if (!admin) return;
    setSaving(true);
    setSaveMsg("");

    const numOrNull = (v: string) => v ? parseFloat(v) : null;
    const intOrNull = (v: string) => v ? parseInt(v) : null;
    const arrOrNull = (v: string) => v ? v.split(",").map((s) => s.trim()).filter(Boolean) : null;

    const res = await fetch("/api/admin/district-data", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        districtId: admin.district_id,
        population: intOrNull(form.population),
        families_count: intOrNull(form.families_count),
        mahallas_count: intOrNull(form.mahallas_count),
        labor_force: intOrNull(form.labor_force),
        employed_count: intOrNull(form.employed_count),
        unemployed_count: intOrNull(form.unemployed_count),
        unemployment_rate: numOrNull(form.unemployment_rate),
        poverty_rate: numOrNull(form.poverty_rate),
        poverty_families: intOrNull(form.poverty_families),
        migrants_abroad: intOrNull(form.migrants_abroad),
        vacant_jobs: intOrNull(form.vacant_jobs),
        small_businesses_count: intOrNull(form.small_businesses_count),
        individual_entrepreneurs: intOrNull(form.individual_entrepreneurs),
        foreign_companies: intOrNull(form.foreign_companies),
        sme_loans_bln: numOrNull(form.sme_loans_bln),
        key_sectors: arrOrNull(form.key_sectors),
        industrial_zones: intOrNull(form.industrial_zones),
        markets_count: intOrNull(form.markets_count),
        export_volume_mln_usd: numOrNull(form.export_volume_mln_usd),
        schools_count: intOrNull(form.schools_count),
        kindergartens_count: intOrNull(form.kindergartens_count),
        kindergarten_coverage_pct: numOrNull(form.kindergarten_coverage_pct),
        hospitals_count: intOrNull(form.hospitals_count),
        roads_km: numOrNull(form.roads_km),
        electricity_pct: numOrNull(form.electricity_pct),
        gas_pct: numOrNull(form.gas_pct),
        water_pct: numOrNull(form.water_pct),
        road_quality_pct: numOrNull(form.road_quality_pct),
        recommended_sectors: arrOrNull(form.recommended_sectors),
        development_priorities: arrOrNull(form.development_priorities),
        notes: form.notes || null,
      }),
    });

    setSaving(false);
    setSaveMsg(res.ok ? "Saqlandi!" : "Xato yuz berdi");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function upd(field: keyof DistrictDataForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const districtName = districts.find((d) => d.id === admin?.district_id)?.name_uz || admin?.district_id || "";

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{districtName}</h1>
          <p className="text-sm text-muted">{admin?.full_name} &mdash; Tuman admin</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_data"); router.push("/admin/login"); }}
          className="text-sm text-muted hover:text-foreground"
        >
          Chiqish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background rounded-lg p-1 mb-6">
        {(["stats", "data"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
              tab === t ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {t === "stats" ? "Statistika" : "Tuman ma'lumotlari"}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === "stats" && stats && (
        <div className="space-y-4 fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Jami sessiyalar", value: stats.total_sessions },
              { label: "Tugatilgan", value: `${stats.completed_sessions} (${stats.completion_rate}%)` },
              { label: "Biznes yo'li", value: stats.business_path },
              { label: "Ish yo'li", value: stats.job_path },
            ].map((s, i) => (
              <div key={i} className="bg-surface rounded-xl border border-border p-4">
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-3">Top sohalar</h3>
              {stats.top_spheres.length > 0 ? (
                <div className="space-y-2">
                  {stats.top_spheres.map(([sphere, count]) => (
                    <div key={sphere} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{sphere}</span>
                      <span className="text-sm font-medium text-primary">{count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted">Ma&#39;lumot yo&#39;q</p>}
            </div>

            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-3">Yosh taqsimoti</h3>
              {Object.keys(stats.age_distribution).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.age_distribution).map(([age, count]) => (
                    <div key={age} className="flex items-center justify-between">
                      <span className="text-sm">{age}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted">Ma&#39;lumot yo&#39;q</p>}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="font-semibold mb-1">Ro&#39;yxatdan o&#39;tgan foydalanuvchilar</h3>
            <div className="text-3xl font-bold text-primary">{stats.registered_users}</div>
          </div>
        </div>
      )}

      {tab === "stats" && !stats && (
        <div className="text-center text-muted py-12">Statistika yuklanmoqda...</div>
      )}

      {/* Data input tab */}
      {tab === "data" && (
        <div className="space-y-6 fade-in">
          {/* Demographics */}
          <Section title="Demografiya">
            <Row label="Aholi soni" value={form.population} onChange={(v) => upd("population", v)} type="number" />
            <Row label="Oilalar soni" value={form.families_count} onChange={(v) => upd("families_count", v)} type="number" />
            <Row label="Mahallalar soni" value={form.mahallas_count} onChange={(v) => upd("mahallas_count", v)} type="number" />
          </Section>

          {/* Employment */}
          <Section title="Bandlik">
            <Row label="Mehnat resurslari" value={form.labor_force} onChange={(v) => upd("labor_force", v)} type="number" />
            <Row label="Bandlar soni" value={form.employed_count} onChange={(v) => upd("employed_count", v)} type="number" />
            <Row label="Ishsizlar soni" value={form.unemployed_count} onChange={(v) => upd("unemployed_count", v)} type="number" />
            <Row label="Ishsizlik darajasi (%)" value={form.unemployment_rate} onChange={(v) => upd("unemployment_rate", v)} />
            <Row label="Kambagrlik darajasi (%)" value={form.poverty_rate} onChange={(v) => upd("poverty_rate", v)} />
            <Row label="Kam ta'minlangan oilalar" value={form.poverty_families} onChange={(v) => upd("poverty_families", v)} type="number" />
            <Row label="Chet elga ketganlar" value={form.migrants_abroad} onChange={(v) => upd("migrants_abroad", v)} type="number" />
            <Row label="Bo'sh ish o'rinlari" value={form.vacant_jobs} onChange={(v) => upd("vacant_jobs", v)} type="number" />
          </Section>

          {/* Business */}
          <Section title="Tadbirkorlik">
            <Row label="Kichik biznes (yuridik)" value={form.small_businesses_count} onChange={(v) => upd("small_businesses_count", v)} type="number" />
            <Row label="YaTT lar soni" value={form.individual_entrepreneurs} onChange={(v) => upd("individual_entrepreneurs", v)} type="number" />
            <Row label="Chet el korxonalari" value={form.foreign_companies} onChange={(v) => upd("foreign_companies", v)} type="number" />
            <Row label="KBga kreditlar (mlrd so'm)" value={form.sme_loans_bln} onChange={(v) => upd("sme_loans_bln", v)} />
            <Row label="Asosiy sohalar (vergul bilan)" value={form.key_sectors} onChange={(v) => upd("key_sectors", v)} />
            <Row label="Sanoat zonalari" value={form.industrial_zones} onChange={(v) => upd("industrial_zones", v)} type="number" />
            <Row label="Bozorlar soni" value={form.markets_count} onChange={(v) => upd("markets_count", v)} type="number" />
            <Row label="Eksport ($M)" value={form.export_volume_mln_usd} onChange={(v) => upd("export_volume_mln_usd", v)} />
          </Section>

          {/* Infrastructure */}
          <Section title="Infratuzilma">
            <Row label="Maktablar" value={form.schools_count} onChange={(v) => upd("schools_count", v)} type="number" />
            <Row label="Bolalar bog'chalari" value={form.kindergartens_count} onChange={(v) => upd("kindergartens_count", v)} type="number" />
            <Row label="MTM qamrovi (%)" value={form.kindergarten_coverage_pct} onChange={(v) => upd("kindergarten_coverage_pct", v)} />
            <Row label="Shifoxonalar" value={form.hospitals_count} onChange={(v) => upd("hospitals_count", v)} type="number" />
            <Row label="Yo'llar (km)" value={form.roads_km} onChange={(v) => upd("roads_km", v)} />
            <Row label="Elektr (%)" value={form.electricity_pct} onChange={(v) => upd("electricity_pct", v)} />
            <Row label="Gaz (%)" value={form.gas_pct} onChange={(v) => upd("gas_pct", v)} />
            <Row label="Suv (%)" value={form.water_pct} onChange={(v) => upd("water_pct", v)} />
            <Row label="Yo'l sifati (%)" value={form.road_quality_pct} onChange={(v) => upd("road_quality_pct", v)} />
          </Section>

          {/* Recommendations */}
          <Section title="Tavsiyalar">
            <Row label="Tavsiya etilgan sohalar (vergul bilan)" value={form.recommended_sectors} onChange={(v) => upd("recommended_sectors", v)} />
            <Row label="Rivojlanish ustuvorliklari (vergul bilan)" value={form.development_priorities} onChange={(v) => upd("development_priorities", v)} />
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Qo&#39;shimcha izohlar</label>
              <textarea
                value={form.notes} onChange={(e) => upd("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none text-sm resize-none"
              />
            </div>
          </Section>

          <div className="flex items-center gap-4 pb-8">
            <button
              onClick={handleSave} disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            {saveMsg && <span className={`text-sm ${saveMsg.includes("Xato") ? "text-red-500" : "text-accent"}`}>{saveMsg}</span>}
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <h3 className="font-semibold mb-4 text-primary">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Row({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <input
        type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none text-sm"
      />
    </div>
  );
}
