export default function VenuesLoading() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="h-9 w-64 bg-border/50 rounded animate-pulse mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border bg-background p-6 rounded-lg animate-pulse">
              <div className="h-6 bg-border/50 rounded w-3/4 mb-3" />
              <div className="h-4 bg-border/50 rounded w-1/2 mb-2" />
              <div className="h-4 bg-border/50 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
