import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "BiznesYo'l — Платформа занятости Узбекистана",
  description:
    "Помогаем безработным гражданам найти работу или открыть малый бизнес. Ishsiz fuqarolarga ish topish yoki kichik biznes ochishda yordam beramiz.",
  keywords: [
    "бизнес Узбекистан",
    "малый бизнес",
    "кредит",
    "biznes",
    "ish topish",
    "kredit",
  ],
  openGraph: {
    title: "BiznesYo'l — Найди работу или открой бизнес",
    description:
      "Умный опрос → AI-рекомендации → пошаговый план действий",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-inter)] relative">
        {/* Asakabank watermark background */}
        <div
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <img
            src="/asakabank-logo.png"
            alt=""
            className="w-full max-w-[90vw] h-auto object-contain opacity-[0.10]"
          />
        </div>
        <div className="relative z-10 min-h-full flex flex-col">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
