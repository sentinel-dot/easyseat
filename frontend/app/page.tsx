// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">
        Willkommen bei easyseat
      </h1>
      <p className="text-center text-lg mb-12">
        Buchen Sie Ihre nächste Reservierung einfach und schnell
      </p>
      <div className="text-center">
        <Link 
          href="/venues"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          Venues entdecken
        </Link>
      </div>
    </main>
  );
}