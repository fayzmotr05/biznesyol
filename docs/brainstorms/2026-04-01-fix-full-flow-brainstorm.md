# Brainstorm: Fix Full App Flow

**Date:** 2026-04-01
**Status:** Decided — ready for /workflows:plan
**Goal:** Get BiznesYo'l working end-to-end: landing → survey → results → tracker

---

## Key Decisions

1. **Supabase:** Run migration via Supabase Management API using service role key. App requires Supabase — no localStorage-only fallback needed.
2. **Translations:** Auto-translate ALL checklist steps in business_types.json to Uzbek and English. Full trilingual experience.
3. **Data flow fix:** Don't clear localStorage on survey submit. Results page reads localStorage first, falls back to Supabase.
4. **Type fix:** Make ChecklistStep fields match the updated JSON (text_uz, text_ru, text_en all required).
5. **Cleanup:** Remove orphaned route group dirs, fix landing page dead code.

## Scope

- Fix all 6 identified bugs
- Translate 100+ checklist steps to uz/en
- Verify Supabase connection end-to-end
- Test full flow: landing → survey → results → tracker

## Next Step

Run `/workflows:plan` to create implementation plan.
