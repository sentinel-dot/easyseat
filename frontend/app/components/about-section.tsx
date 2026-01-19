// app/components/about-section.tsx
'use client'

export function AboutSection() {
  return (
    <section id="ueber-mich" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Über mich
            </h2>
            <div className="w-24 h-1 bg-rose-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Platzhalter für Bild */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-rose-100 to-amber-100 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm">Bild hier einfügen</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Herzlich willkommen! Ich bin [Name der Schwägerin] und habe mich auf 
                <strong className="text-rose-600"> Augenbrauen-Lifting</strong> und 
                <strong className="text-rose-600"> Augenbrauen-Extensions</strong> spezialisiert.
              </p>
              
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Mit jahrelanger Erfahrung und Leidenschaft für die Schönheitspflege 
                helfe ich Ihnen dabei, Ihre natürliche Schönheit zu unterstreichen. 
                Jede Behandlung wird individuell auf Sie abgestimmt, damit Sie sich 
                jeden Tag selbstbewusst und wunderschön fühlen.
              </p>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Meine Qualifikationen
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-rose-600 mr-2">✓</span>
                    <span>Zertifizierte Ausbildung in Augenbrauen-Lifting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-rose-600 mr-2">✓</span>
                    <span>Spezialisierung auf natürliche Extensions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-rose-600 mr-2">✓</span>
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
