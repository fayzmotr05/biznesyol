"use client";

import { useState } from "react";
import type { Locale, UserProfile } from "@/types";
import { t } from "@/lib/i18n";

interface UserRegistrationProps {
  lang: Locale;
  onComplete: (profile: UserProfile) => void;
  districtId: string;
}

export default function UserRegistration({ lang, onComplete, districtId }: UserRegistrationProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [education, setEducation] = useState("");
  const [familySize, setFamilySize] = useState("");
  const [income, setIncome] = useState("");
  const [employment, setEmployment] = useState("");
  const [experience, setExperience] = useState(false);
  const [unemployedFamily, setUnemployedFamily] = useState("");
  const [step, setStep] = useState(1);

  const canProceedStep1 = name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 12;
  const canProceedStep2 = gender !== "";

  function handleSubmit() {
    onComplete({
      full_name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      birth_year: birthYear ? parseInt(birthYear) : undefined,
      gender: gender as "male" | "female",
      district_id: districtId,
      education: education as UserProfile["education"],
      family_size: familySize ? parseInt(familySize) : undefined,
      unemployed_family_members: unemployedFamily ? parseInt(unemployedFamily) : undefined,
      monthly_income_mln: income ? parseFloat(income) : undefined,
      employment_status: employment as UserProfile["employment_status"],
      has_business_experience: experience,
    });
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
  }

  return (
    <div className="question-enter w-full max-w-lg mx-auto">
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {t(lang, "Ma'lumotlaringiz", "Ваши данные", "Your information")}
            </h2>
            <p className="text-sm text-muted">
              {t(lang,
                "Shaxsiy biznes-reja uchun kerak",
                "Нужны для персонального бизнес-плана",
                "Required for your personalized business plan"
              )}
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t(lang, "To'liq ism-familiyangiz", "Полное имя", "Full name")} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(lang, "Aliyev Ali", "Алиев Али", "Ali Aliyev")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t(lang, "Telefon raqam", "Номер телефона", "Phone number")} *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="+998 90 123 4567"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t(lang, "Tug'ilgan yilingiz", "Год рождения", "Year of birth")}
              </label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="1990"
                min="1960"
                max="2008"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 rounded-xl bg-primary text-white font-medium transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t(lang, "Davom etish", "Продолжить", "Continue")}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t(lang, "Jinsingiz", "Ваш пол", "Gender")} *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: "male", uz: "Erkak", ru: "Мужской", en: "Male" },
                  { v: "female", uz: "Ayol", ru: "Женский", en: "Female" },
                ].map((g) => (
                  <button
                    key={g.v}
                    onClick={() => setGender(g.v as "male" | "female")}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      gender === g.v ? "border-primary bg-primary-light text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {t(lang, g.uz, g.ru, g.en)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t(lang, "Ta'lim darajangiz", "Образование", "Education level")}
              </label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
              >
                <option value="">{t(lang, "Tanlang", "Выберите", "Select")}</option>
                <option value="none">{t(lang, "Umumiy o'rta", "Среднее", "Secondary")}</option>
                <option value="vocational">{t(lang, "Kasb-hunar", "Среднее специальное", "Vocational")}</option>
                <option value="higher">{t(lang, "Oliy", "Высшее", "Higher")}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t(lang, "Oila a'zolari", "Членов семьи", "Family size")}
                </label>
                <input
                  type="number"
                  value={familySize}
                  onChange={(e) => setFamilySize(e.target.value)}
                  placeholder="4"
                  min="1" max="20"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {t(lang, "Oylik daromad (mln)", "Доход (млн сум)", "Income (mln)")}
                </label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="3"
                  step="0.5"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t(lang, "Hozirgi holatingiz", "Текущий статус", "Current status")}
              </label>
              <select
                value={employment}
                onChange={(e) => setEmployment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
              >
                <option value="">{t(lang, "Tanlang", "Выберите", "Select")}</option>
                <option value="unemployed">{t(lang, "Ishsiz", "Безработный", "Unemployed")}</option>
                <option value="part_time">{t(lang, "Yarim stavka", "Частичная занятость", "Part-time")}</option>
                <option value="informal">{t(lang, "Norasmiy ish", "Неофициальная работа", "Informal work")}</option>
                <option value="student">{t(lang, "Talaba", "Студент", "Student")}</option>
              </select>
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={experience}
                onChange={(e) => setExperience(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">
                {t(lang, "Biznes yuritish tajribam bor", "У меня есть опыт ведения бизнеса", "I have business experience")}
              </span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t(lang, "Oilangizda nechta ishsiz a'zo bor?", "Сколько безработных членов в семье?", "How many unemployed family members?")}
              </label>
              <input
                type="number"
                value={unemployedFamily}
                onChange={(e) => setUnemployedFamily(e.target.value)}
                placeholder="0"
                min="0" max="20"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
              />
              <p className="text-xs text-muted mt-1">
                {t(lang,
                  "Ularni ham biznesga jalb qilish imkoniyatini ko'rib chiqamiz",
                  "Рассмотрим возможность привлечь их к бизнесу",
                  "We'll consider involving them in the business"
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-border text-muted font-medium hover:border-primary/40 transition-all"
              >
                {t(lang, "Orqaga", "Назад", "Back")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canProceedStep2}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-medium transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t(lang, "So'rovnomani boshlash", "Начать опрос", "Start survey")}
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted text-center mt-4">
          {t(lang,
            "Ma'lumotlaringiz faqat biznes-reja uchun ishlatiladi va uchinchi tomonlarga berilmaydi",
            "Данные используются только для бизнес-плана и не передаются третьим лицам",
            "Your data is used only for the business plan and is not shared with third parties"
          )}
        </p>
      </div>
    </div>
  );
}
