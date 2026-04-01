---
title: "Fix Full Flow + UI/UX + AI Integration Improvements"
type: feat
date: 2026-04-01
---

# Fix Full Flow + UI/UX + AI Integration

## Overview

BiznesYo'l has the architecture in place but the end-to-end flow is broken. This plan fixes all blockers, improves scoring quality, adds proper AI integration, translates all content, and polishes the UI/UX for mobile-first usage by low-digital-literacy users in Uzbekistan.

## Phase 1: Critical Blockers (Must fix to run)

### 1.1 Fix ChecklistStep data mismatch
- Update `data/business_types.json`: add `text_uz` and `text_en` to all checklist_steps (100+ steps across 20 business types)
- Keep type requiring all 3 fields

### 1.2 Fix landing page dead code
- Remove the broken `t()` call with JSX in `src/app/page.tsx`

### 1.3 Clean up orphaned directories
- Delete empty `src/app/(survey)/`, `src/app/(results)/`, `src/app/(tracker)/`

### 1.4 Fix data flow: survey → results
- Don't clear localStorage on survey submit
- Results page: add timeout + "no data found" state with link back to survey
- Save sessionId to localStorage so tracker can find it

### 1.5 Fix streaming JSON parsing
- In results page: extract JSON from Claude response (find first `{` to last `}`)
- Add try/catch with user-facing error message

### 1.6 Fix tracker businessTypeId
- Save selected business to localStorage when user clicks a BusinessCard
- Tracker reads it from localStorage for success story submission

## Phase 2: AI Integration

### 2.1 Anthropic API key
- User needs to set `ANTHROPIC_API_KEY` in `.env.local`
- Add model as env var: `ANTHROPIC_MODEL` with fallback

### 2.2 Improve business plan prompt
- Add English system prompt for `lang=en`
- Sanitize user inputs before interpolating into prompt
- Add specific Anthropic error handling (rate limit, timeout)

### 2.3 Make scoring smarter
- Optional skills contribute 0.5x weight
- Graduated capital scale (not binary 1 vs 0.3)
- Competition "много" = 0.2 (not 0.0)
- Add score interpretation labels: "Ajoyib mos" / "O'rtacha" / "Past"

## Phase 3: UI/UX Polish

### 3.1 Loading & error states
- Survey submit: show spinner overlay before redirect
- Results page: "no data" state with CTA
- API errors: show toast message, not silent fail
- Plan generation: disable button immediately on click

### 3.2 Mobile improvements
- Test all components at 320px width
- Add `@media print` stylesheet for PDF button
- Add confirmation dialog for "Start over"

### 3.3 Back button fix
- Don't delete answer when going back — preserve it so user can edit

### 3.4 Accessibility
- Add `role="progressbar"` + aria attrs to ProgressBar
- Add `aria-label` to all interactive buttons

## Phase 4: Translations
- Translate all 100+ checklist steps in business_types.json to Uzbek and English
- Add `description_uz` to all 20 business types (currently only `description_ru`)

## Acceptance Criteria

- [ ] Full flow works: landing → survey → results → tracker
- [ ] All 3 languages display correct text everywhere
- [ ] AI plan generates and displays without errors
- [ ] Scoring produces differentiated results (top-1 score > top-5 by at least 15%)
- [ ] No silent failures — all errors show user-facing messages
- [ ] Mobile usable at 320px width
- [ ] "Start over" has confirmation
- [ ] Back button preserves answers
