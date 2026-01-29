'use client'

export function HeroSection() {
  return (
    <section className="relative bg-cream py-20 sm:py-24 md:py-32 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-foreground leading-[1.15] tracking-tight">
            Augenbrauenlifting,
            <br />
            Wimpernlifting
            <br />
            <span className="text-primary">& Zahnschmuck</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
            Professionelle Beauty-Behandlungen – von Expertin zu Expertin. Individuelle Beratung und natürliche Ergebnisse.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="#buchung"
              className="inline-block bg-primary text-cream px-7 py-3.5 text-sm font-medium hover:bg-primary-dark transition text-center"
            >
              Jetzt Termin buchen
            </a>
            <a
              href="#preise"
              className="inline-block border border-primary text-primary px-7 py-3.5 text-sm font-medium hover:bg-primary hover:text-cream transition text-center"
            >
              Preise ansehen
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
