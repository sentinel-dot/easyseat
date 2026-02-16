"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerAuthOptional } from "@/contexts/CustomerAuthContext";
import { SiteLayout } from "@/components/layout/site-layout";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useCustomerAuthOptional();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth?.isLoading && !auth?.isAuthenticated) {
      window.location.href = "/bookings/my-bookings?login=1";
    }
  }, [auth?.isLoading, auth?.isAuthenticated]);

  const isActive = (path: string) =>
    pathname === path || (path !== "/customer" && pathname.startsWith(path));

  if (auth?.isLoading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" aria-hidden />
        </div>
      </SiteLayout>
    );
  }

  if (!auth?.isAuthenticated) {
    return (
      <SiteLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-[var(--color-muted)]">Weiterleitung …</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <nav aria-label="Kundenbereich" className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/customer/dashboard"
              className={`rounded px-3 py-2 font-medium transition-colors ${
                isActive("/customer/dashboard")
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Übersicht
            </Link>
            <Link
              href="/customer/bookings"
              className={`rounded px-3 py-2 font-medium transition-colors ${
                isActive("/customer/bookings")
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Meine Buchungen
            </Link>
            <Link
              href="/customer/favorites"
              className={`rounded px-3 py-2 font-medium transition-colors ${
                isActive("/customer/favorites")
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Favoriten
            </Link>
            <Link
              href="/customer/loyalty"
              className={`rounded px-3 py-2 font-medium transition-colors ${
                isActive("/customer/loyalty")
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Treuepunkte
            </Link>
            <Link
              href="/customer/profile"
              className={`rounded px-3 py-2 font-medium transition-colors ${
                isActive("/customer/profile")
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Profil
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </SiteLayout>
  );
}
