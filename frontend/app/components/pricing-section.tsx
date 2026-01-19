// app/components/pricing-section.tsx
'use client'

import { Service } from '@/lib/types';

interface Props {
  services: Service[];
}

export function PricingSection({ services }: Props) {
  return (
    <section id="preise" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Preise
            </h2>
            <div className="w-24 h-1 bg-rose-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 px-2">
              Transparente Preise für alle Behandlungen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.duration_minutes} Min.
                    </span>
                  </div>
                </div>
                {service.price && (
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-rose-600">
                      {Number(service.price).toFixed(2)} €
                    </div>
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>

          {/* Zusatzinformationen */}
          <div className="bg-rose-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-rose-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Wichtige Informationen
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
              <li className="flex items-start">
                <span className="text-rose-600 mr-3 mt-1">✓</span>
                <span>
                  <strong>Stornierung:</strong> Termine können bis zu 24 Stunden vorher kostenlos storniert werden.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-600 mr-3 mt-1">✓</span>
                <span>
                  <strong>Zahlung:</strong> Barzahlung oder EC-Karte vor Ort möglich.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-600 mr-3 mt-1">✓</span>
                <span>
                  <strong>Nachbehandlung:</strong> Nach dem ersten Lifting erhalten Sie 10% Rabatt auf die nächste Behandlung.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
