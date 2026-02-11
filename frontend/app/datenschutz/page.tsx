import { SiteLayout } from "@/components/layout/site-layout";

export const metadata = {
  title: "Datenschutz – easyseat",
  description: "Datenschutzerklärung der easyseat-Plattform.",
};

export default function DatenschutzPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl text-[var(--color-text)]">
          Datenschutzerklärung
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Stand: [Datum einfügen]
        </p>

        <section className="mt-8 space-y-8 text-[var(--color-text)]">
          <div>
            <h2 className="font-display text-lg text-[var(--color-text)]">
              1. Verantwortlicher
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              <br />
              [Name und Anschrift des Verantwortlichen]
              <br />
              E-Mail: [Kontakt-E-Mail]
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-[var(--color-text)]">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Beim Aufruf unserer Website werden durch den Browser auf Ihrem
              Endgerät automatisch Informationen an den Server gesendet. Diese
              Informationen werden temporär in einem sogenannten Logfile
              gespeichert. Erfasst werden u. a.: IP-Adresse, Datum und Uhrzeit
              des Zugriffs, angeforderte Datei/URL, übertragene Datenmenge,
              Browsertyp und -version, Betriebssystem, Referrer-URL. Die
              Verarbeitung erfolgt zur Gewährleistung eines reibungslosen
              Verbindungsaufbaus und zur Auswertung der Systemsicherheit und
              -stabilität. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die
              Daten werden nach spätestens 7 Tagen gelöscht, sofern keine
              Aufbewahrung zu Beweiszwecken erforderlich ist.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-[var(--color-text)]">
              3. Buchungsanfragen
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Wenn Sie über die Plattform eine Buchungsanfrage stellen, werden
              die von Ihnen angegebenen Daten (Name, E-Mail, ggf. Telefon,
              Terminwunsch) verarbeitet. Diese Daten werden zum Zweck der
              Durchführung der Buchung, der Kommunikation mit Ihnen und der
              Weitergabe an das jeweilige Unternehmen (Restaurant, Salon etc.)
              genutzt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
              (Vertragsanbahnung bzw. Vertragserfüllung). Die Speicherdauer
              richtet sich nach den gesetzlichen Aufbewahrungspflichten und den
              berechtigten Interessen des Anbieters.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-[var(--color-text)]">
              4. Weitergabe von Daten
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Eine Weitergabe Ihrer personenbezogenen Daten an Dritte zu anderen
              als den im Folgenden genannten Zwecken erfolgt nicht. Wir geben
              Ihre Daten nur weiter, wenn Sie Ihre Einwilligung erteilt haben
              (Art. 6 Abs. 1 lit. a DSGVO), die Weitergabe zur Erfüllung eines
              Vertrags erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO), eine
              gesetzliche Verpflichtung besteht (Art. 6 Abs. 1 lit. c DSGVO)
              oder die Weitergabe zur Wahrung berechtigter Interessen erforderlich
              ist (Art. 6 Abs. 1 lit. f DSGVO). Im Rahmen von Buchungen werden
              Ihre Daten an das jeweilige gebuchte Unternehmen weitergegeben.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-[var(--color-text)]">
              5. Ihre Rechte
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung
              (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der
              Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20
              DSGVO) und Widerspruch (Art. 21 DSGVO). Sie haben ferner das
              Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren
              (Art. 77 DSGVO).
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-[var(--color-text)]">
              6. Hosting
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Diese Website wird bei [Hosting-Anbieter, z. B. Vercel Inc.] gehostet.
              Dabei können personenbezogene Daten (z. B. IP-Adresse, Zugriffszeiten)
              an den Hoster übermittelt werden. Ein Auftragsverarbeitungsvertrag
              wurde mit dem Hoster geschlossen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg text-[var(--color-text)]">
              7. Änderungen
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um
              sie an geänderte Rechtslage oder bei Änderungen des Angebots
              anzupassen. Die aktuelle Version finden Sie stets auf dieser
              Seite.
            </p>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
