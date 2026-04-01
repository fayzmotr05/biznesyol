# PROGRESS — Трекер разработки платформы

## ✅ Фаза 0: Данные (DONE)
- [x] MASTER_PLAN.md — главный документ
- [x] data/districts.json — районы Узбекистана (130+ записей, все регионы)
- [x] data/business_types.json — 20 видов бизнеса с навыками, капиталом, чеклистами
- [x] data/banks.json — 7 банковских продуктов с условиями и фильтрами
- [x] PROGRESS.md — этот файл

## ⏳ Фаза 1: Инициализация проекта (NEXT)
- [ ] Создать Next.js 14 проект: `npx create-next-app@latest . --typescript --tailwind --app`
- [ ] Установить зависимости: supabase-js, @anthropic-ai/sdk
- [ ] Настроить .env.local (ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY, TWOGIS_API_KEY)
- [ ] Скопировать data/ в проект
- [ ] Создать /types/index.ts — TypeScript типы для всех сущностей

## ⏳ Фаза 2: Backend — Supabase
- [ ] Создать схему БД (миграции в /supabase/migrations/)
  - [ ] users (анонимные сессии)
  - [ ] survey_sessions
  - [ ] survey_answers
  - [ ] recommendations (сохранённые рекомендации)
  - [ ] progress_tracking (трекер шагов)
  - [ ] success_stories (истории успеха)
- [ ] Настроить RLS политики
- [ ] Seed данные районов и видов бизнеса

## ⏳ Фаза 3: Survey Engine
- [ ] /lib/survey/questions.ts — все вопросы с ветвлением
- [ ] /lib/survey/engine.ts — логика next_question()
- [ ] /lib/survey/validator.ts — валидация ответов
- [ ] Юнит-тесты survey engine

## ⏳ Фаза 4: Scoring Engine
- [ ] /lib/scoring/index.ts — scoreBusinessTypes()
- [ ] /lib/scoring/bank_selector.ts — selectBankProduct()
- [ ] /lib/scoring/competition.ts — анализ конкурентов
- [ ] Юнит-тесты с граничными кейсами

## ⏳ Фаза 5: Claude API
- [ ] /lib/prompts/business_plan.ts — buildPrompt()
- [ ] /app/api/generate-plan/route.ts — streaming endpoint
- [ ] /app/api/survey/route.ts — сохранение ответов
- [ ] /app/api/recommendations/route.ts — получение рекомендаций

## ⏳ Фаза 6: UI — Опросник
- [ ] /components/survey/SurveyCard.tsx — карточка вопроса
- [ ] /components/survey/PathSplit.tsx — экран выбора пути
- [ ] /components/survey/ProgressBar.tsx
- [ ] /app/(survey)/page.tsx — главная страница опроса

## ⏳ Фаза 7: UI — Результаты
- [ ] /components/results/BusinessCard.tsx — карточка бизнеса с score
- [ ] /components/results/BankCard.tsx — карточка банка
- [ ] /components/results/BusinessPlan.tsx — streaming план
- [ ] /components/results/Checklist.tsx — чеклист с чекбоксами
- [ ] /app/(results)/page.tsx

## ⏳ Фаза 8: Progress Tracker
- [ ] /components/tracker/ProgressSteps.tsx
- [ ] /app/(tracker)/page.tsx

## ⏳ Фаза 9: Админ-дашборд
- [ ] /app/(dashboard)/page.tsx — статистика
- [ ] /app/(dashboard)/map/page.tsx — карта
- [ ] Supabase Auth для district_admin роли

## ⏳ Фаза 10: i18n
- [ ] /locales/ru.json и /locales/uz.json
- [ ] Переключатель языков в хедере

## ⏳ Фаза 11: PDF экспорт
- [ ] /app/api/export-pdf/route.ts

## 🔮 Фаза 12: v2
- [ ] SMS/USSD версия
- [ ] Интеграция с hh.uz API (путь А — работа)
- [ ] Система менторов

---

## Известные ограничения на старте
- 2GIS API ключ нужно получить отдельно → пока используем mock данные
- Данные по районам (население) частично приблизительные — уточнять по переписи 2026
- SMS версия отложена до v2
