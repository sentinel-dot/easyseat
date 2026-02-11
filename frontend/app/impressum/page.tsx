import { SiteLayout } from "@/components/layout/site-layout";

export const metadata = {
  title: "Impressum – easyseat",
  description: "Impressum und Angaben gemäß § 5 TMG.",
};

export default function ImpressumPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
          Impressum
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-soft)]">
          Angaben gemäß § 5 Telemediengesetz (TMG)
        </p>

        <section className="mt-8 space-y-6 text-[var(--color-text)]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Anbieter / Diensteanbieter
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              [Firmenname bzw. Vor- und Nachname des Betreibers]
              <br />
              [Straße und Hausnummer]
              <br />
              [PLZ und Ort]
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Kontakt
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              E-Mail: [Kontakt-E-Mail-Adresse]
              <br />
              Telefon: [optional]
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Umsatzsteuer-ID
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              [Falls vorhanden: Umsatzsteuer-Identifikationsnummer gemäß § 27a
              UStG]
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              [Name und Anschrift]
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              EU-Streitschlichtung
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Haftung für Inhalte
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
              Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben unberührt. Eine diesbezügliche
              Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
              konkreten Rechtsverletzung möglich. Bei Bekanntwerden von
              entsprechenden Rechtsverletzungen werden wir diese Inhalte
              umgehend entfernen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Haftung für Links
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar. Eine permanente inhaltliche
              Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
              Bekanntwerden von Rechtsverletzungen werden wir derartige Links
              umgehend entfernen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)]">
              Urheberrecht
            </h2>
            <p className="mt-2 text-[var(--color-text-soft)]">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser
              Seite nicht vom Betreiber erstellt wurden, werden die
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
              Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
              Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
              entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
