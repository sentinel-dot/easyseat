import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="font-serif text-6xl sm:text-8xl font-semibold text-primary/20 mb-4">404</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Seite nicht gefunden
        </h1>
        <p className="text-muted mb-8">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition"
        >
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
