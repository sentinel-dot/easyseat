// components/layout/header.tsx
'use client'

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-bold text-rose-600">
            Augenbrauen Studio
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="#ueber-mich" className="text-gray-700 hover:text-rose-600 transition text-sm lg:text-base">
              Über mich
            </Link>
            <Link href="#augenbrauen-lifting" className="text-gray-700 hover:text-rose-600 transition text-sm lg:text-base">
              Services
            </Link>
            <Link href="#buchung" className="text-gray-700 hover:text-rose-600 transition text-sm lg:text-base">
              Termin buchen
            </Link>
            <Link href="#preise" className="text-gray-700 hover:text-rose-600 transition text-sm lg:text-base">
              Preise
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <Link
            href="#buchung"
            className="hidden md:block bg-rose-600 text-white px-5 py-2 rounded-full hover:bg-rose-700 transition font-semibold text-sm lg:text-base"
          >
            Jetzt buchen
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-rose-600 transition"
            aria-label="Menü öffnen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-4 pt-4">
              <Link 
                href="#ueber-mich" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-rose-600 transition py-2"
              >
                Über mich
              </Link>
              <Link 
                href="#augenbrauen-lifting" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-rose-600 transition py-2"
              >
                Services
              </Link>
              <Link 
                href="#buchung" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-rose-600 transition py-2"
              >
                Termin buchen
              </Link>
              <Link 
                href="#preise" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-rose-600 transition py-2"
              >
                Preise
              </Link>
              <Link
                href="#buchung"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition font-semibold text-center mt-2"
              >
                Jetzt buchen
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
