// components/layout/footer.tsx
'use client'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">Kontakt</h3>
            <p className="mb-2 text-sm sm:text-base">
              <strong>Studio:</strong> [Adresse einfügen]
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <strong>Telefon:</strong> [Telefonnummer einfügen]
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <strong>E-Mail:</strong> [E-Mail einfügen]
            </p>
          </div>

          <div>
            <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">Öffnungszeiten</h3>
            <p className="mb-2 text-sm sm:text-base">Montag - Freitag: 9:00 - 18:00 Uhr</p>
            <p className="mb-2 text-sm sm:text-base">Samstag: Nach Vereinbarung</p>
            <p className="text-sm sm:text-base">Sonntag: Geschlossen</p>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">Rechtliches</h3>
            <p className="mb-2 text-sm sm:text-base">
              <a href="#" className="hover:text-rose-400 transition">Impressum</a>
            </p>
            <p className="mb-2 text-sm sm:text-base">
              <a href="#" className="hover:text-rose-400 transition">Datenschutz</a>
            </p>
            <p className="text-sm sm:text-base">
              <a href="#" className="hover:text-rose-400 transition">AGB</a>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} Augenbrauen Studio. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
