import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "АВТОLUX42 — Премиальные автомобили",
  description: "Подбор и доставка автомобилей из Китая, Кореи и Японии.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${oswald.variable} antialiased`} style={{ fontFamily: 'var(--font-oswald)' }}>{children}</body>
    </html>
  );
}