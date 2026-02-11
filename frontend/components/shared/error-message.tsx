import { Button } from "./button";

export function ErrorMessage({
  title = "Etwas ist schiefgelaufen",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error-muted)] p-6 text-center shadow-[var(--shadow-sm)]"
      role="alert"
    >
      <p className="font-semibold text-[var(--color-text)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Erneut versuchen
        </Button>
      )}
    </div>
  );
}
