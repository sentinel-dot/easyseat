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
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
      role="alert"
    >
      <p className="font-medium text-red-800">{title}</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-sm font-medium text-red-700 underline hover:no-underline"
        >
          Erneut versuchen
        </button>
      )}
    </div>
  );
}
