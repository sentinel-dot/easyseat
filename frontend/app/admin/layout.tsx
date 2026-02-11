"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/types";
import { Button } from "@/components/shared/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }
    getCurrentUser()
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      })
      .finally(() => setAuthChecked(true));
  }, [mounted, isLoginPage, pathname, router]);

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  };

  if (!mounted || (!isLoginPage && !authChecked)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <nav className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-lg text-[var(--color-text)] hover:opacity-80"
            >
              easyseat Admin
            </Link>
            <Link
              href="/admin"
              className={`text-sm ${pathname === "/admin" ? "font-medium text-[var(--color-accent)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"}`}
            >
              Übersicht
            </Link>
            <Link
              href="/admin/bookings"
              className={`text-sm ${pathname === "/admin/bookings" ? "font-medium text-[var(--color-accent)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"}`}
            >
              Buchungen
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-[var(--color-muted)]">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
