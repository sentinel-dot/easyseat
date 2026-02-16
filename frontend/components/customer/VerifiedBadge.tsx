"use client";

interface VerifiedBadgeProps {
  verified: boolean;
  size?: "sm" | "md";
}

export function VerifiedBadge({ verified, size = "md" }: VerifiedBadgeProps) {
  const sizeClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (!verified) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:border-emerald-500 dark:bg-emerald-900/80 dark:text-emerald-50"
      title="E-Mail verifiziert"
    >
      <svg className={sizeClasses} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Verifiziert
    </span>
  );
}
