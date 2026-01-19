import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Augenbrauen-Lifting & Extensions | Professionelle Beauty-Behandlung",
  description: "Professionelles Augenbrauen-Lifting und Augenbrauen-Extensions. Individuelle Beratung, natürliche Ergebnisse. Jetzt Termin buchen!",
  keywords: "Augenbrauen-Lifting, Augenbrauen Extensions, Beauty-Behandlung, Augenbrauen Studio",
  authors: [{ name: "Augenbrauen Studio" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#e11d48",
  openGraph: {
    title: "Augenbrauen-Lifting & Extensions | Professionelle Beauty-Behandlung",
    description: "Professionelles Augenbrauen-Lifting und Augenbrauen-Extensions. Individuelle Beratung, natürliche Ergebnisse.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#e11d48" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
