import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "easyseat – Tische & Termine einfach buchen",
  description:
    "Reservieren Sie Ihren Tisch oder Termin bei Restaurants, Friseuren und weiteren Betrieben in Ihrer Nähe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={dmSans.variable}>
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
