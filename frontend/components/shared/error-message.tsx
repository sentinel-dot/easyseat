interface ErrorMessageProps {
  message: string;
  variant?: 'error' | 'warning';
  className?: string;
}

export function ErrorMessage({ message, variant = 'error', className = '' }: ErrorMessageProps) {
  const isWarning = variant === 'warning';
  const bgClass = isWarning ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const textClass = isWarning ? 'text-amber-800' : 'text-red-700';

  return (
    <div className={`rounded-lg border p-4 ${bgClass} ${className}`} role="alert">
      <p className={textClass}>{message}</p>
    </div>
  );
}
