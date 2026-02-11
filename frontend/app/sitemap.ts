import type { MetadataRoute } from 'next';
import { getVenues } from '@/lib/api/venues';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://easyseat.vercel.app');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/venues`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/impressum`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/datenschutz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/agb`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  let venuePages: MetadataRoute.Sitemap = [];
  try {
    const result = await getVenues();
    if (result.success && result.data?.length) {
      venuePages = result.data.map((venue) => ({
        url: `${baseUrl}/venues/${venue.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Sitemap still works with static pages only
  }

  return [...staticPages, ...venuePages];
}
