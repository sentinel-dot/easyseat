import { SiteLayout } from "@/components/layout/site-layout";

export const metadata = {
  title: "AGB – easyseat",
  description: "Allgemeine Geschäftsbedingungen der easyseat-Plattform.",
};

export default function AGBPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-soft)]">
          Für die Nutzung der Buchungsplattform easyseat
          <br />
          Stand: [Datum einfügen]
        </p>

        <section className="mt-8 space-y-8 text-[var(--color-text)]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              § 1 Geltungsbereich
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Diese AGB gelten für die Nutzung der Buchungsplattform easyseat
              („Plattform“) und die über die Plattform angebahnten
              Buchungsanfragen und Verträge zwischen Nutzern („Gäste“) und den
              auf der Plattform gelisteten Betrieben („Anbieter“). Abweichende
              Bedingungen des Gastes oder des Anbieters werden nicht anerkannt,
              sofern nicht ausdrücklich zugestimmt wird.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              § 2 Leistungsbeschreibung
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Die Plattform ermöglicht es Gästen, Buchungsanfragen (z. B. für
              Tischreservierungen oder Termine) an Anbieter zu richten. Der
              Betreiber der Plattform vermittelt nur den Kontakt; der
              Buchungsvertrag kommt zwischen Gast und Anbieter zustande. Der
              Betreiber ist nicht Partei des Buchungsvertrags und haftet nicht
              für die Erbringung der vom Anbieter geschuldeten Leistungen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              § 3 Buchungsanfrage und Vertragsschluss
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Die Abgabe einer Buchungsanfrage über die Plattform stellt ein
              unverbindliches Anfrageangebot des Gastes dar. Der Vertrag mit dem
              Anbieter kommt erst zustande, wenn der Anbieter die Buchung
              bestätigt (z. B. per E-Mail oder über die Plattform). Bis zur
              Bestätigung besteht kein Anspruch auf den gewünschten Termin.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              § 4 Stornierung durch den Gast
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Stornierungsfristen und -bedingungen ergeben sich aus den
              Angaben des jeweiligen Anbieters (z. B. auf der Buchungsseite
              oder in der Bestätigungsmail). Der Gast ist verpflichtet,
              Stornierungen fristgerecht vorzunehmen. Die Stornierung erfolgt
              über die auf der Plattform bereitgestellte Funktion oder direkt
              beim Anbieter.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              § 5 Haftung
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Der Betreiber der Plattform haftet unbeschadet der gesetzlichen
              Haftung nur für Vorsatz und grobe Fahrlässigkeit sowie bei
              Verletzung von Leben, Körper oder Gesundheit. Die Haftung für
              leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht
              wesentliche Vertragspflichten verletzt werden. Die Haftung des
              Anbieters gegenüber dem Gast richtet sich nach den mit dem
              Anbieter vereinbarten bzw. gesetzlichen Bestimmungen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              § 6 Schlussbestimmungen
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Es gilt das Recht der Bundesrepublik Deutschland unter
              Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit
              gesetzlich zulässig, der Sitz des Betreibers. Sollten einzelne
              Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen
              Bestimmungen unberührt.
            </p>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
