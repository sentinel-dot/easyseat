"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerAuthOptional } from "@/contexts/CustomerAuthContext";
import { LoginDialog } from "@/components/customer/LoginDialog";
import { RegisterDialog } from "@/components/customer/RegisterDialog";

export function Header() {
  const pathname = usePathname();
  const auth = useCustomerAuthOptional();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-bold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 rounded"
          >
            <span className="text-[var(--color-accent)]">easy</span>seat
          </Link>
          <nav className="flex items-center gap-1 sm:gap-4" aria-label="Hauptnavigation">
            <Link
              href="/venues"
              className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/venues")
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Orte finden
            </Link>
            <Link
              href={auth?.isAuthenticated ? "/customer/bookings" : "/bookings/my-bookings"}
              className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/bookings") || isActive("/customer/bookings")
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Meine Buchungen
            </Link>
            {auth?.isAuthenticated && (
              <Link
                href="/customer/favorites"
                className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/customer/favorites")
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Favoriten
              </Link>
            )}
            <Link
              href="/impressum"
              className="hidden rounded px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] sm:block"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="hidden rounded px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] sm:block"
            >
              Datenschutz
            </Link>
            <Link
              href="/venues"
              className="ml-1 inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              Jetzt buchen
            </Link>

            {auth?.isLoading ? (
              <span className="ml-1 h-9 w-20 animate-pulse rounded-md bg-[var(--color-border)]" aria-hidden />
            ) : auth?.isAuthenticated && auth.customer ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-page)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="max-w-[120px] truncate sm:max-w-[160px]">{auth.customer.name}</span>
                  <svg className="h-4 w-4 shrink-0 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
                    role="menu"
                  >
                    <Link
                      href="/customer/dashboard"
                      className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Mein Konto
                    </Link>
                    <Link
                      href="/customer/bookings"
                      className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Meine Buchungen
                    </Link>
                    <Link
                      href="/customer/favorites"
                      className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Favoriten
                    </Link>
                    <Link
                      href="/customer/profile"
                      className="block px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profil
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        auth.logout();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
                      role="menuitem"
                    >
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-page)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  Anmelden
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterOpen(true)}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  Registrieren
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        switchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        switchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}
