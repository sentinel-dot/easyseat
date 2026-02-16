"use client";

interface FeatureLockedTooltipProps {
  children: React.ReactNode;
  isLocked: boolean;
  reason?: string;
}

export function FeatureLockedTooltip({
  children,
  isLocked,
  reason = "Bitte verifizieren Sie Ihre E-Mail-Adresse, um diese Funktion zu nutzen.",
}: FeatureLockedTooltipProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 group-hover:block">
        <div className="relative rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-gray-700">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="whitespace-nowrap">{reason}</span>
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2">
            <div className="h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
