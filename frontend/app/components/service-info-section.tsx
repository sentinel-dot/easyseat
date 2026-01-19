// app/components/service-info-section.tsx
'use client'

export function ServiceInfoSection() {
  return (
    <section id="augenbrauen-lifting" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Was ist Augenbrauen-Lifting?
            </h2>
            <div className="w-24 h-1 bg-rose-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-12 sm:mb-16">
            {/* Lifting */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Augenbrauen-Lifting
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                Beim Augenbrauen-Lifting werden Ihre natürlichen Augenbrauen 
                mit einer speziellen Lösung behandelt, die sie für mehrere 
                Wochen in Form hält. Die Haare werden sanft nach oben gebogen 
                und fixiert, sodass Sie jeden Morgen perfekt gestylte 
                Augenbrauen haben – ohne tägliches Styling!
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Hält 6-8 Wochen</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Natürlicher Look</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Wasserdicht nach 24 Stunden</span>
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  <span>Geeignet für alle Haartypen</span>
                </li>
              </ul>
            </div>

            {/* Extensions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Augenbrauen-Extensions
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                Augenbrauen-Extensions sind die perfekte Lösung für dünne, 
                lückenhafte oder zu kurze Augenbrauen. Mit hochwertigen 
                synthetischen Haaren werden Ihre natürlichen Augenbrauen 
                Strich für Strich ergänzt, bis Sie die gewünschte Form 
                und Fülle erreichen.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span>Hält 3-4 Wochen</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span>Individuelle Form</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span>Natürliches Aussehen</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span>Perfekt für dünne Brauen</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Ablauf */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
              So läuft Ihre Behandlung ab
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { step: '1', title: 'Beratung', desc: 'Wir besprechen Ihre Wünsche und finden die perfekte Form' },
                { step: '2', title: 'Vorbereitung', desc: 'Ihre Augenbrauen werden gereinigt und vorbereitet' },
                { step: '3', title: 'Behandlung', desc: 'Die Behandlung wird professionell durchgeführt' },
                { step: '4', title: 'Fertig!', desc: 'Sie erhalten Pflegetipps für optimale Haltbarkeit' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
