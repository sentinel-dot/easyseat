import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SiteLayout } from "@/components/layout/site-layout";
import { ToasterProvider } from "@/components/shared/toaster-provider";
import { getVenueById } from "@/lib/api/venues";
import type { VenueWithStaff } from "@/lib/types";

const PRIMARY_VENUE_ID = 3;

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

async function getPrimaryVenue(): Promise<VenueWithStaff | null> {
  try {
    const res = await getVenueById(PRIMARY_VENUE_ID);
    return res.success && res.data ? res.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const venue = await getPrimaryVenue();
  const name = venue?.name ?? "EasySeat";
  return {
    title: "Augenbrauenlifting, Wimpernlifting & Zahnschmuck | Professionelle Beauty-Behandlung",
    description:
      "Professionelles Augenbrauenlifting, Wimpernlifting und Zahnschmuck. Individuelle Beratung, natürliche Ergebnisse. Jetzt Termin buchen!",
    keywords: "Augenbrauenlifting, Wimpernlifting, Zahnschmuck, Beauty-Behandlung",
    authors: [{ name }],
    viewport: "width=device-width, initial-scale=1, maximum-scale=5",
    themeColor: "#6B5344",
    openGraph: {
      title: "Augenbrauenlifting, Wimpernlifting & Zahnschmuck | Professionelle Beauty-Behandlung",
      description:
        "Professionelles Augenbrauenlifting, Wimpernlifting und Zahnschmuck. Individuelle Beratung, natürliche Ergebnisse.",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const venue = await getPrimaryVenue();

  return (
    <html lang="de" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#6B5344" />
      </head>
      <body
        className={`${cormorant.variable} ${sourceSans.variable} font-sans antialiased`}
      >
        <SiteLayout venue={venue}>{children}</SiteLayout>
        <ToasterProvider />
      </body>
    </html>
  );
}
