'use client'

import { Service } from '@/lib/types';

interface Props {
  services: Service[];
}

export function PricingSection({ services }: Props) {
  return (
    <section id="preise" className="py-16 md:py-24 bg-offwhite border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-3">
            Preise
          </h2>
          <p className="text-muted mb-12">
            Transparente Preise für alle Behandlungen
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-background border border-border p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-muted text-sm mb-3">{service.description}</p>
                    )}
                    <span className="text-muted text-sm">{service.duration_minutes} Min.</span>
                  </div>
                  {service.price && (
                    <div className="text-primary font-serif text-2xl font-semibold shrink-0">
                      {Number(service.price).toFixed(2)} €
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-background border border-border p-6 sm:p-8">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
              Wichtige Informationen
            </h3>
            <ul className="space-y-3 text-foreground/90 text-sm">
              <li className="flex gap-3">
                <span className="text-primary shrink-0">—</span>
                <span><strong>Stornierung:</strong> Termine können bis zu 24 Stunden vorher kostenlos storniert werden.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0">—</span>
                <span><strong>Zahlung:</strong> Barzahlung oder EC-Karte vor Ort möglich.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary shrink-0">—</span>
                <span><strong>Nachbehandlung:</strong> Nach dem ersten Lifting erhalten Sie 10% Rabatt auf die nächste Behandlung.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
