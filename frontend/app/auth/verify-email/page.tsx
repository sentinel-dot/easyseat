"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail } from "@/lib/api/customer-auth";
import { SiteLayout } from "@/components/layout/site-layout";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Kein Verifizierungstoken gefunden.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        if (res.success) {
          setStatus("success");
          setMessage(res.data?.message || "E-Mail erfolgreich verifiziert!");
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/customer/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(res.message || "Verifizierung fehlgeschlagen.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      });
  }, [searchParams, router]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-lg">
          {status === "loading" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-[var(--color-text)]">
                E-Mail wird verifiziert...
              </h1>
              <p className="mt-2 text-[var(--color-muted)]">
                Bitte warten Sie einen Moment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-950">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-[var(--color-text)]">
                Erfolgreich verifiziert! 🎉
              </h1>
              <p className="mt-2 text-[var(--color-muted)]">{message}</p>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400 bg-emerald-100 px-4 py-3 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-900/80 dark:text-emerald-50">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-950">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    Sie haben 25 Bonuspunkte erhalten!
                  </p>
                  <p className="mt-0.5 text-xs opacity-90">
                    Als Dankeschön für die Bestätigung Ihrer E-Mail-Adresse.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-sm text-[var(--color-muted)]">
                Sie werden automatisch weitergeleitet...
              </p>
              <a
                href="/customer/dashboard"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                Zum Dashboard
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                <svg
                  className="h-10 w-10 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-[var(--color-text)]">
                Verifizierung fehlgeschlagen
              </h1>
              <p className="mt-2 text-[var(--color-muted)]">{message}</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <a
                  href="/customer/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Zum Dashboard
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-page)]"
                >
                  Zur Startseite
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
