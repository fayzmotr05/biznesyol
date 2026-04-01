"use client";

import type { BankMatch, Locale } from "@/types";
import { t, localized } from "@/lib/i18n";

interface BankCardProps {
  bank: BankMatch;
  lang: Locale;
}

export default function BankCard({ bank, lang }: BankCardProps) {
  const bp = bank.bank_product;
  const bpObj = bp as unknown as Record<string, unknown>;
  const name = localized(bpObj, "bank_name", lang);
  const product = localized(bpObj, "product_name", lang);
  const notes = localized(bpObj, "notes", lang);

  return (
    <div className="rounded-2xl border border-gray-200 p-5 question-enter">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{bp.logo_emoji}</span>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-primary">{product}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-sm text-gray-500">{t(lang, "Summa", "Сумма", "Amount")}</div>
          <div className="font-semibold">
            {bp.min_amount_mln}–{bp.max_amount_mln}{" "}
            <span className="text-xs text-gray-500">{t(lang, "mln", "млн", "M")}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-sm text-gray-500">{t(lang, "Stavka", "Ставка", "Rate")}</div>
          <div className="font-semibold">{bp.interest_rate_annual}%</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-sm text-gray-500">{t(lang, "Muddat", "Срок", "Term")}</div>
          <div className="font-semibold">
            {t(lang, `${bp.term_months_max} oygacha`, `до ${bp.term_months_max} мес`, `up to ${bp.term_months_max} mo`)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-sm text-gray-500">{t(lang, "Tasdiqlash", "Одобрение", "Approval")}</div>
          <div className="font-semibold">
            {t(lang, `~${bp.processing_days} kun`, `~${bp.processing_days} дней`, `~${bp.processing_days} days`)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {!bp.requires_collateral && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            {t(lang, "Garovsiz", "Без залога", "No collateral")}
          </span>
        )}
        {!bp.requires_guarantor && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {t(lang, "Kafilsiz", "Без поручителя", "No guarantor")}
          </span>
        )}
        {bp.digital_application && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
            {t(lang, "Onlayn", "Онлайн", "Online")}
          </span>
        )}
      </div>

      {bank.match_reasons.length > 0 && (
        <ul className="text-sm text-gray-600 space-y-1 mb-4">
          {bank.match_reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-accent mt-0.5">&#10003;</span>
              {reason}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-400 mb-4">{notes}</p>

      <a
        href={bp.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 rounded-xl text-center font-medium text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: "#1EBBD7" }}
      >
        {t(lang, "Ariza topshirish", "Подать заявку", "Apply now")}
      </a>
    </div>
  );
}
