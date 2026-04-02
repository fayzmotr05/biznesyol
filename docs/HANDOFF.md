# BiznesYo'l — Project Handoff Document
**Date:** 2026-04-03
**Status:** MVP live at https://biznesyol.vercel.app
**Repo:** https://github.com/fayzmotr05/biznesyol

---

## What This Platform Does

AI-powered business planning platform for unemployed citizens of Uzbekistan. User takes a survey → AI generates personalized business ideas and a detailed business plan with real Asaka Bank loan recommendations.

**Target audience:** Unemployed people in Uzbekistan who want to start a small business but don't know what to do or how to get funding.

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL + RLS)
- **AI:** Claude Sonnet 4.6 API (with web search enabled for real prices)
- **Deploy:** Vercel (agrionuz account)
- **Languages:** Uzbek (default), Russian, English

---

## Current Architecture

### User Flow
```
Landing (/) → Survey (/survey) → Results (/results) → Tracker (/tracker)

Survey steps:
1. Language selection (uz/ru/en)
2. District selection (158 districts)
3. Path: Job or Business
4. Registration (name, phone, DOB, gender, education, income, employment, unemployed family members)
5. Sphere selection (10 categories: food, beauty, sewing, trade, agro, repair, transport, education, digital, services)
6. 4-5 sphere-specific questions (about the person's current situation)
7. Exact capital (number input, skippable)
8. Competition level
9. Poor registry status
→ Submit to Supabase → Redirect to Results

Results page:
- Shows matching business types for the sphere
- User clicks one → "Generate business plan" button
- AI generates plan using: user data + district admin data + Asaka Bank products from Supabase
- Plan includes: startup items with REAL prices (web search), Asaka Bank loan recommendation, monthly forecast, first steps, risks
```

### Admin System
```
/admin/login → email/password auth
/admin/super → Create/manage district admins, assign districts
/admin/district → Two tabs:
  - Statistics: sessions, completion rate, top spheres, age/gender distribution
  - District data input: 30 fields (demographics, employment, business, infrastructure)
```

### Database (Supabase)
```
Tables:
- survey_sessions (id, lang, district_id, path, answers JSONB, completed, created_at)
- user_profiles (id, session_id, full_name, phone, birth_year, gender, district_id, education, family_size, unemployed_family_members, monthly_income_mln, employment_status, has_business_experience)
- recommendations (id, session_id, business_type_id, score, breakdown JSONB)
- progress_tracking (id, session_id, step, completed_at)
- success_stories (id, district_id, business_type_id, story_ru, story_uz, verified)
- admins (id, email, password_hash, password_plain, full_name, role, district_id, is_active)
- district_data (id, district_id, population, unemployment_rate, poverty_rate, small_businesses_count, individual_entrepreneurs, sme_loans_bln, key_sectors[], recommended_sectors[], schools_count, kindergartens_count, hospitals_count, roads_km, electricity_pct, gas_pct, water_pct, markets_count, export_volume_mln_usd, notes, ...)
- bank_products (id, bank_name, name_uz, name_ru, type, description_uz, who_can_get_uz, min_amount_mln, max_amount_mln, interest_rate_percent, interest_rate_number, term_months_max, grace_period_months, collateral_type, requires_collateral, requires_guarantor, digital_application, target, age_min, age_max, special_conditions_uz, suitable_for_spheres[], is_active)
```

### Key Files
```
src/
  app/
    page.tsx                    — Landing page (trilingual hero)
    survey/page.tsx             — Survey engine (question flow, registration, localStorage)
    results/page.tsx            — Results + AI plan generation
    tracker/page.tsx            — Progress tracker (6 steps)
    admin/login/page.tsx        — Admin login
    admin/super/page.tsx        — Super admin panel
    admin/district/page.tsx     — District admin (stats + data input)
    api/
      survey/route.ts           — Save survey session to Supabase
      generate-plan/route.ts    — AI business plan (Claude + web search)
      generate-ideas/route.ts   — AI business idea suggestions (not yet wired to frontend)
      progress/route.ts         — Progress tracking CRUD
      users/route.ts            — User profile save
      admin/login/route.ts      — Admin auth
      admin/admins/route.ts     — Admin CRUD (super only)
      admin/district-data/route.ts — District data upsert
      admin/stats/route.ts      — Stats aggregation
      success-stories/route.ts  — Success story submit
  lib/
    survey/questions.ts         — ALL survey questions (HARDCODED — needs migration to Supabase)
    survey/engine.ts            — Survey logic (getNextQuestion, isComplete, progress)
    scoring/index.ts            — Business scoring + bank matching (partially legacy)
    prompts/business_plan.ts    — AI prompt builder (reads district data + bank products from Supabase)
    supabase/admin.ts           — Supabase service role client
    supabase/client.ts          — Browser Supabase client
    supabase/server.ts          — Server Supabase client (SSR)
    admin-auth.ts               — Simple JWT token auth for admins
    anthropic.ts                — Anthropic client
    i18n.ts                     — Translation helper: t(lang, uz, ru, en)
  components/
    survey/                     — QuestionCard, PathSplit, DistrictSelect, ProgressBar, UserRegistration
    results/                    — BusinessPlanDisplay, Checklist (BankCard removed — AI handles this now)
    tracker/                    — ProgressSteps
    ui/                         — Header
  types/index.ts                — All TypeScript types
data/
  districts.json                — 158 districts (static, needs ~17 more)
  business_types.json           — 21 business types with checklists (trilingual)
  banks.json                    — OLD fake bank data (DEPRECATED — real data is in Supabase bank_products)
  asaka_bank.json               — Asaka Bank products seed file (real data already in Supabase)
```

---

## What's Working

- ✅ Full survey flow (10 spheres, 4-5 questions each, registration, financial)
- ✅ AI business plan generation with Claude Sonnet 4.6 + web search for real prices
- ✅ Asaka Bank loan recommendations from Supabase (18 products)
- ✅ District admin data feeds into AI analysis
- ✅ Super admin can create district admins
- ✅ District admin can input data and see user stats
- ✅ Trilingual (uz/ru/en), default Uzbek
- ✅ User profiles saved with session linkage
- ✅ Progress tracker with 6 steps
- ✅ Deployed on Vercel, Supabase connected

---

## What Needs Work (Priority Order)

### P0 — Critical
1. **Questions → Supabase migration:** All 50+ survey questions are hardcoded in `src/lib/survey/questions.ts`. Need a `survey_questions` table in Supabase so admins can CRUD questions without redeploying. This is a major rewrite of the survey engine.

2. **Per-answer analytics:** Currently `survey_sessions.answers` stores all answers as one JSON blob. Need to either parse this for analytics or create a separate `survey_answers` table for structured querying (how many chose "sewing"? what equipment do they have?).

3. **AI business IDEAS endpoint:** `/api/generate-ideas` exists but is NOT wired to the frontend. The flow should be: survey complete → AI generates 3-4 personalized ideas → user picks one → THEN AI generates detailed plan for that one. Currently results page shows old business_types from JSON and user manually picks.

4. **Bank admin panel:** `bank_products` table exists in Supabase with 18 Asaka Bank products. Need a UI for bank admins to CRUD these (add new loans, change rates, deactivate products).

### P1 — Important
5. **Opportunities system:** Design exists in brainstorm but not built. After AI calculates startup cost and user's capital, show matching loans/grants/programs. SQL migration `004_admin_password_and_opportunities.sql` has the `opportunities` table schema but needs the UI.

6. **Missing districts:** Have 158, Uzbekistan has 175. Need ~17 more. Data structure is ready, just need to add entries.

7. **Super admin: password visibility:** Migration `004` adds `password_plain` column to admins table. Need UI for super admin to see/copy district admin passwords.

8. **Design overhaul:** Current design is functional but basic. Needs professional UI/UX work, especially the results page and business plan display.

9. **Vercel function timeout:** AI plan with web search takes 20-40 seconds. Vercel free tier has 60s timeout. On heavy prompts it can timeout. Consider: Vercel Pro ($20/mo for 300s timeout), or switch to non-streaming for reliability.

### P2 — Nice to Have
10. **PDF export:** Currently just `window.print()`. Need proper PDF generation.
11. **Real stat.uz data integration:** stat.uz has an API at siat.stat.uz. Could pull real population/employment data.
12. **Job path (Path A):** Survey supports it but results page doesn't handle job recommendations.
13. **SMS notifications:** For low-digital-literacy users.
14. **Rate limiting:** No rate limiting on API endpoints. Important before public launch.

---

## Credentials

All credentials are stored in `.env.local` (gitignored). See `.env.local.example` for required keys.

- **Supabase:** URL and keys in `.env.local`
- **Vercel:** Deploy with `vercel --prod` from repo root
- **Super Admin:** Login at `/admin/login` — credentials in `.env.local`
- **Claude API:** Model `claude-sonnet-4-6`, web search enabled (~$0.05-0.08 per plan)

---

## Cost Estimates

| Component | Monthly cost |
|---|---|
| Supabase | $0 (free tier, up to 250K users) |
| Vercel | $0 (free tier) |
| Claude API (1K users) | ~$50-80 |
| Claude API (10K users) | ~$500-800 |
| **Total (1K users)** | **~$50-80/mo** |

---

## Key Design Decisions

1. **AI-first approach:** No hardcoded scoring formulas for business recommendations. AI generates everything based on user data + district data + bank products.

2. **Asaka Bank partnership:** Platform is built around Asaka Bank products. Bank data is in Supabase — future bank admin can manage products.

3. **District data from admin:** Each district admin inputs real statistics (from government passport documents). AI uses this for district-specific recommendations.

4. **No personal data in recommendations:** AI doesn't see phone numbers in the prompt. Unemployed family count is mentioned only in the "tip" section.

5. **Web search for real prices:** Claude searches OLX.uz and olcha.uz for actual equipment/material prices in Uzbekistan. Slower (20-40s) but much more accurate.

---

## Document References

- `MASTER_PLAN.md` — Original project plan (partially outdated)
- `PROGRESS.md` — Phase tracking (needs update)
- `docs/brainstorms/` — Brainstorm documents
- `docs/plans/` — Implementation plans
- `docs/research/uz-data-sources.md` — Uzbekistan data source research
- `docs/all-questions.txt` — All survey questions exported (may be outdated after recent changes)
- `supabase/migrations/` — All SQL migrations (001-005)

---

## How to Continue

1. Read this file + `CLAUDE.md` + `MASTER_PLAN.md`
2. Run `npm run dev` locally
3. Check `.env.local` has all keys
4. The most impactful next task is **P0 #3: Wire generate-ideas to frontend** — this makes the platform feel like real AI-powered recommendations instead of picking from a fixed list.
