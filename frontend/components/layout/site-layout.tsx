'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import type { VenueWithStaff } from '@/lib/types';

interface SiteLayoutProps {
  children: React.ReactNode;
  venue: VenueWithStaff | null;
}

/**
 * Renders the main site header and footer only on public routes.
 * Admin routes (/admin/*) get no header/footer so the admin layout is full-screen.
 */
export function SiteLayout({ children, venue }: SiteLayoutProps) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      <Header venue={venue} />
      {children}
      <Footer venue={venue} />
    </>
  );
}
