"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/lib/api/customer-auth";

interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const handleResend = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        setMessage({
          type: "success",
          text: "E-Mail wurde erneut versendet. Bitte Postfach prüfen",
        });
      } else {
        setMessage({
          type: "error",
          text: result.message || "Fehler beim Senden der E-Mail",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Fehler beim Senden der E-Mail",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] border-l-4 border-l-orange-500 bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <svg
            className="h-5 w-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            E-Mail-Adresse noch nicht bestätigt
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Bitte bestätigen Sie Ihre E-Mail-Adresse (<strong className="text-[var(--color-text)]">{email}</strong>), um alle Funktionen nutzen zu
            können. Überprüfen Sie Ihr Postfach und klicken Sie auf den Bestätigungslink.
          </p>
          
          {message && (
            <div
              className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-400 bg-emerald-100 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-900/80 dark:text-emerald-50"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/60 dark:text-red-200"
              }`}
            >
              {message.type === "success" ? (
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-emerald-950">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : (
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Wird gesendet...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  E-Mail erneut senden
                </>
              )}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
            >
              Später
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
          aria-label="Banner schließen"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
