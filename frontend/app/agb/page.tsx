import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AGB',
  description: 'Allgemeine Geschäftsbedingungen für Terminbuchungen.',
};

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-6">
          <p className="text-muted">
            Bitte passen Sie diese AGB an Ihr Unternehmen und ggf. rechtliche Vorgaben an.
          </p>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">1. Geltungsbereich</h2>
            <p>
              Diese AGB gelten für alle Terminbuchungen über unsere Website. Mit der Buchung akzeptieren Sie diese Bedingungen.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">2. Vertragsschluss</h2>
            <p>
              Die Buchung kommt zustande, sobald Sie den Buchungsbutton bestätigen und eine Bestätigung (per E-Mail bzw. auf der Website) erhalten. Wir behalten uns vor, Termine bei begründetem Anlass abzusagen.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">3. Stornierung durch den Kunden</h2>
            <p>
              Stornierungen sind bis zu der auf der Buchungsseite bzw. in der Bestätigung angegebenen Frist (z. B. 24 Stunden vor Termin) kostenfrei möglich. Bei späterer Absage oder Nichterscheinen können wir eine Ausfallgebühr berechnen.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">4. Preise und Zahlung</h2>
            <p>
              Die angezeigten Preise verstehen sich in Euro inkl. der gesetzlichen Mehrwertsteuer. Die Zahlung erfolgt vor Ort [oder wie bei Ihnen geregelt].
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">5. Sonstiges</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist [Ihr Ort], sofern gesetzlich zulässig.
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
