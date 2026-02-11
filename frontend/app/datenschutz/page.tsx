import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Datenschutzerklärung und Informationen zur Verarbeitung personenbezogener Daten.',
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Datenschutzerklärung</h1>
        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-6">
          <p className="text-muted">
            Bitte ergänzen Sie diese Datenschutzerklärung mit Ihren konkreten Angaben (Verantwortlicher, Hosting, verwendete Dienste usw.).
          </p>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">1. Verantwortlicher</h2>
            <p>
              [Name und Anschrift des Verantwortlichen]<br />
              E-Mail: [E-Mail]
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p>
              Beim Besuch unserer Website werden durch den Browser automatisch Informationen an unseren Server gesendet (u. a. IP-Adresse, Datum und Uhrzeit, aufgerufene Seiten). Diese Daten werden ausschließlich zur Gewährleistung eines störungsfreien Betriebs ausgewertet und nicht an Dritte weitergegeben.
            </p>
            <p>
              Bei einer Terminbuchung erheben wir Name, E-Mail-Adresse, ggf. Telefonnummer und Termindaten. Diese Daten werden nur zur Durchführung und Abwicklung der Buchung sowie zur Kommunikation mit Ihnen verwendet.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">3. Rechtsgrundlage</h2>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Betrieb der Website).
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">4. Speicherdauer</h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie es für die Erfüllung des Vertragszwecks oder gesetzlicher Aufbewahrungsfristen erforderlich ist.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">5. Ihre Rechte</h2>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Beschwerden können Sie bei einer Aufsichtsbehörde für den Datenschutz einreichen.
            </p>
          </section>
          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8 mb-2">6. Hosting / Drittanbieter</h2>
            <p>
              [Falls Sie Vercel, Railway o. Ä. nutzen: Kurze Angabe, dass Server in der EU/EWR liegen oder Auftragsverarbeitungsvertrag besteht.]
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
