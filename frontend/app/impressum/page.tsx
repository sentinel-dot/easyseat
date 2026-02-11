import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum und Angaben gemäß § 5 TMG.',
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Impressum</h1>
        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-6">
          <p className="text-muted">
            Angaben gemäß § 5 TMG. Bitte ersetzen Sie die Platzhalter durch Ihre tatsächlichen Daten.
          </p>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">Anbieter</h2>
            <p>
              [Name des Unternehmens / Inhaber]<br />
              [Straße und Hausnummer]<br />
              [PLZ und Ort]
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">Kontakt</h2>
            <p>
              E-Mail: [Kontakt-E-Mail]<br />
              Telefon: [Telefonnummer]
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">Umsatzsteuer-ID</h2>
            <p>
              [Falls vorhanden: Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG]
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">Verantwortlich für den Inhalt</h2>
            <p>
              [Name und Anschrift des Verantwortlichen]
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor Verbraucherschlichtungsstellen teilzunehmen.
            </p>
          </section>
        </div>
        <p className="mt-10">
          <Link href="/" className="text-primary hover:underline font-medium">← Zur Startseite</Link>
        </p>
      </div>
    </main>
  );
}
