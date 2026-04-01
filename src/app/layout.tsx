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
      <body className="min-h-full flex flex-col font-[var(--font-inter)]">
        <Header />
        {children}
      </body>
    </html>
  );
}
