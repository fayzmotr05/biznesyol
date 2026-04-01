# AsakaBusiness — Employment Platform for Uzbekistan

## Project Overview
AI-powered platform helping unemployed citizens of Uzbekistan find jobs (Path A) or start a small business (Path B) through a smart survey, scoring engine, Claude AI recommendations, and step-by-step action checklists.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + RLS)
- **AI**: Claude API (claude-sonnet-4-5) — streaming
- **Maps**: 2GIS API (mock for now)
- **Deploy**: Vercel
- **Languages**: Russian + Uzbek (Latin)

## Project Structure
```
/                    — project root
  data/              — static JSON data (districts, business_types, banks)
  types/index.ts     — all TypeScript types (no logic)
  app/               — Next.js App Router pages & API routes
  components/        — React components
  lib/               — business logic (survey, scoring, prompts)
  locales/           — i18n translations (ru.json, uz.json)
  supabase/          — migrations and seed files
```

## Data Files
- `districts.json` — 130+ districts of Uzbekistan with coords, population, type (urban/mixed/rural)
- `business_types.json` — 20 business types with skills, capital, checklists, seasonal coefficients
- `banks.json` — 7 bank loan products with eligibility filters

## Development Phases
See `MASTER_PLAN.md` for full plan and `PROGRESS.md` for detailed task tracking.

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | DONE | Data files (districts, business_types, banks) |
| 1 | IN PROGRESS | Project init, types, env setup |
| 2 | TODO | Supabase schema & migrations |
| 3 | TODO | Survey engine (questions + branching) |
| 4 | TODO | Scoring engine |
| 5 | TODO | Claude API prompts & routes |
| 6 | TODO | UI — Survey |
| 7 | TODO | UI — Results + checklist |
| 8 | TODO | Progress tracker |
| 9 | TODO | Admin dashboard |
| 10 | TODO | i18n (ru/uz) |
| 11 | TODO | PDF export |
| 12 | TODO | v2 (SMS, hh.uz, mentors) |

## Conventions
- Types-only in `/types/` — no business logic
- All user-facing strings must support both `_ru` and `_uz` suffixes
- Scoring formula weights: skills 0.30, capital 0.25, competition 0.20, risk 0.15, season 0.10
- Bank selection filters: collateral, gender, age, location, audience type
- UI must be extremely simple — target audience has low digital literacy
- Disclaimer about AI recommendations is mandatory

## Commands
```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # lint
```
