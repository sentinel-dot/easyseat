'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { VenueWithStaff } from '@/lib/types';

interface HeaderProps {
  venue?: VenueWithStaff | null;
}

/** Von der Startseite: #ueber-mich. Von Unterseiten: /#ueber-mich, damit man zur Startseite springt. */
function anchorHref(pathname: string | null, hash: string): string {
  return pathname === '/' ? hash : `/${hash}`;
}

export function Header({ venue }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const siteName = venue?.name ?? 'EasySeat';

  return (
    <header className="bg-cream/95 backdrop-blur border-b border-border sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-xl md:text-2xl font-semibold text-primary tracking-tight">
            {siteName}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href={anchorHref(pathname, '#ueber-mich')} className="text-muted hover:text-primary transition text-sm tracking-wide">
              Über mich
            </Link>
            <Link href={anchorHref(pathname, '#services')} className="text-muted hover:text-primary transition text-sm tracking-wide">
              Services
            </Link>
            <Link href={anchorHref(pathname, '#buchung')} className="text-muted hover:text-primary transition text-sm tracking-wide">
              Termin buchen
            </Link>
            <Link href={anchorHref(pathname, '#preise')} className="text-muted hover:text-primary transition text-sm tracking-wide">
              Preise
            </Link>
          </div>

          <Link
            href={anchorHref(pathname, '#buchung')}
            className="hidden md:block bg-primary text-cream px-5 py-2.5 text-sm font-medium hover:bg-primary-dark transition tracking-wide"
          >
            Jetzt buchen
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-primary transition"
            aria-label="Menü öffnen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-1">
              <Link href={anchorHref(pathname, '#ueber-mich')} onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-muted hover:text-primary transition text-sm">
                Über mich
              </Link>
              <Link href={anchorHref(pathname, '#services')} className="py-2.5 text-muted hover:text-primary transition text-sm" onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>
              <Link href={anchorHref(pathname, '#buchung')} onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-muted hover:text-primary transition text-sm">
                Termin buchen
              </Link>
              <Link href={anchorHref(pathname, '#preise')} onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-muted hover:text-primary transition text-sm">
                Preise
              </Link>
              <Link
                href={anchorHref(pathname, '#buchung')}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 bg-primary text-cream px-6 py-3 text-sm font-medium hover:bg-primary-dark transition text-center"
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
