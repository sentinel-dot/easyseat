"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, logout } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/owner", label: "Übersicht", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/owner/bookings", label: "Buchungen", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/owner/calendar", label: "Kalender", icon: "M6 2v2h12V2h2v2h2a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h2V2H6zm14 6H4v12h16V8z" },
  { href: "/owner/services", label: "Leistungen", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V5a2 2 0 00-2-2M5 3v2M5 19v-4a2 2 0 012-2h6a2 2 0 012 2v4M5 19h14" },
  { href: "/owner/availability", label: "Verfügbarkeit", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/owner/settings", label: "Einstellungen", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/owner/stats", label: "Statistik", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    getCurrentUser()
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          if (res.data.role === "admin") {
            router.replace("/admin");
            return;
          }
          if (res.data.role !== "owner") {
            router.replace("/login?reason=owner-only");
            return;
          }
        } else {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      })
      .finally(() => setAuthChecked(true));
  }, [mounted, pathname, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout().catch(() => {});
    router.replace("/login");
    router.refresh();
  };

  if (!mounted || !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-page)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (!user || user.role === "admin") {
    return null;
  }

  const navContent = (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/owner" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-accent-muted)] text-[var(--color-accent-strong)]"
                : "text-[var(--color-text-soft)] hover:bg-[var(--color-page)] hover:text-[var(--color-text)]"
            }`}
          >
            <NavIcon d={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page)]"
          aria-label="Menü öffnen"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/owner" className="font-display text-lg text-[var(--color-text)]">
          easyseat Dashboard
        </Link>
        <div className="w-10" />
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] pt-14 transition-transform duration-200 lg:pt-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-14 items-center border-b border-[var(--color-border)] px-4 lg:px-5">
          <Link href="/owner" className="font-display text-lg font-semibold text-[var(--color-text)]">
            <span className="text-[var(--color-accent)]">easy</span>seat Dashboard
          </Link>
        </div>
        <div className="overflow-y-auto p-3 pb-24 lg:p-4 lg:pb-24">{navContent}</div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <p className="truncate px-2 text-xs text-[var(--color-muted)]">{user?.email}</p>
          <p className="truncate px-2 text-xs text-[var(--color-muted)]">{user?.name || "Betreiber"}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-8">
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
            >
              <span className="hidden max-w-[180px] truncate text-[var(--color-muted)] sm:inline">
                {user?.email}
              </span>
              <svg className="h-5 w-5 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-lg)]">
                <div className="border-b border-[var(--color-border)] px-3 py-2">
                  <p className="truncate text-sm font-medium text-[var(--color-text)]">{user?.name || "Betreiber"}</p>
                  <p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
                </div>
                <Link
                  href="/owner/settings#password"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Passwort ändern
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-page)]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>

        <main className="min-h-[calc(100vh-3.5rem)] px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
