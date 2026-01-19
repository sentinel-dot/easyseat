// app/components/hero-section.tsx
'use client'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 py-16 sm:py-20 md:py-32 overflow-hidden">
      {/* Dekorative Elemente - nur auf größeren Screens für Performance */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Perfekte Augenbrauen
            <span className="block text-rose-600 mt-2">für jeden Tag</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 leading-relaxed px-2">
            Professionelles Augenbrauen-Lifting & Extensions
            <br className="hidden sm:block" />
            <span className="block sm:inline sm:ml-2 text-base sm:text-lg text-gray-600">von Expertin zu Expertin</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <a
              href="#buchung"
              className="bg-rose-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              Jetzt Termin buchen
            </a>
            <a
              href="#preise"
              className="bg-white text-rose-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold border-2 border-rose-600 hover:bg-rose-50 transition-all active:scale-95"
            >
              Preise ansehen
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}
