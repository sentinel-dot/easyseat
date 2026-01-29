'use client'

import Image from 'next/image'

export function AboutSection() {
  return (
    <section id="ueber-mich" className="py-16 md:py-24 bg-offwhite border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-12">
            Über mich
          </h2>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="/about_me_picture.jpeg"
                alt="Lea – Augenbrauenlifting, Wimpernlifting & Zahnschmuck"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="space-y-5">
              <p className="text-foreground/90 leading-relaxed">
                Herzlich willkommen! Ich bin Lea und habe mich auf{' '}
                <strong className="text-primary font-medium">Augenbrauenlifting</strong>,{' '}
                <strong className="text-primary font-medium">Wimpernlifting</strong> und{' '}
                <strong className="text-primary font-medium">Zahnschmuck</strong> spezialisiert.
              </p>

              <p className="text-foreground/90 leading-relaxed">
                Mit jahrelanger Erfahrung und Leidenschaft für die Schönheitspflege helfe ich Ihnen dabei, Ihre natürliche Schönheit zu unterstreichen. Jede Behandlung wird individuell auf Sie abgestimmt.
              </p>

              <div className="pt-6 border-t border-border">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Qualifikationen
                </h3>
                <ul className="space-y-3 text-foreground/90">
                  <li className="flex gap-3">
                    <span className="text-primary shrink-0">—</span>
                    <span>Zertifizierte Ausbildung in Augenbrauenlifting & Wimpernlifting</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary shrink-0">—</span>
                    <span>Spezialisierung auf Zahnschmuck</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary shrink-0">—</span>
                    <span>Regelmäßige Weiterbildungen</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
