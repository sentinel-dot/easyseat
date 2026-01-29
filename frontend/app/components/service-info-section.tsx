'use client'

export function ServiceInfoSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-cream border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-12">
            Unsere Services
          </h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 mb-16">
            <div className="border border-border bg-background p-6 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-4">
                Augenbrauenlifting
              </h3>
              <p className="text-foreground/85 text-sm leading-relaxed mb-5">
                Beim Augenbrauenlifting werden Ihre natürlichen Brauen mit einer speziellen Lösung behandelt, die sie für mehrere Wochen in Form hält. Die Haare werden sanft nach oben gebogen und fixiert – perfekt gestylte Brauen ohne tägliches Styling.
              </p>
              <ul className="space-y-2 text-muted text-sm">
                <li>Hält 6–8 Wochen</li>
                <li>Natürlicher Look</li>
                <li>Zupfen/Wachsen & Färben optional</li>
              </ul>
            </div>

            <div className="border border-border bg-background p-6 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-4">
                Wimpernlifting
              </h3>
              <p className="text-foreground/85 text-sm leading-relaxed mb-5">
                Wimpernlifting verleiht Ihren Wimpern mehr Wölbung und Länge – ganz ohne Extensions. Die natürlichen Wimpern werden dauerhaft nach oben gebogen und wirken dadurch länger und wacher. Mit oder ohne Färben buchbar.
              </p>
              <ul className="space-y-2 text-muted text-sm">
                <li>Hält mehrere Wochen</li>
                <li>Mit oder ohne Färben</li>
                <li>Wacher, natürlicher Look</li>
              </ul>
            </div>

            <div className="border border-border bg-background p-6 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-4">
                Zahnschmuck
              </h3>
              <p className="text-foreground/85 text-sm leading-relaxed mb-5">
                Dekorativer Zahnschmuck verleiht Ihrem Lächeln einen besonderen Glanz. Die kleinen Steinchen oder Motive werden professionell auf den Zahn aufgebracht und sind ein trendiger Hingucker für besondere Anlässe.
              </p>
              <ul className="space-y-2 text-muted text-sm">
                <li>Dekorative Steinchen & Motive</li>
                <li>Professionelle Anbringung</li>
                <li>Für besondere Anlässe</li>
              </ul>
            </div>
          </div>

          <div className="border border-border bg-offwhite p-6 sm:p-8">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
              Ablauf Ihrer Behandlung
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Beratung', desc: 'Wir besprechen Ihre Wünsche und die passende Behandlung' },
                { step: '02', title: 'Vorbereitung', desc: 'Bereich wird gereinigt und vorbereitet' },
                { step: '03', title: 'Behandlung', desc: 'Die Behandlung wird professionell durchgeführt' },
                { step: '04', title: 'Fertig', desc: 'Sie erhalten Pflegetipps für optimale Haltbarkeit' },
              ].map((item) => (
                <div key={item.step}>
                  <span className="text-primary font-serif text-sm font-semibold">{item.step}</span>
                  <h4 className="font-medium text-foreground mt-1 mb-2">{item.title}</h4>
                  <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
