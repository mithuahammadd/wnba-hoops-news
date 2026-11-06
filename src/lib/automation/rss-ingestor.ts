import { XMLParser } from 'fast-xml-parser';

export interface DiscoveredFeedItem {
  sourceName: string;
  originalTitle: string;
  normalizedTitle: string;
  canonicalUrl: string;
  publishedAt: string;
  factualSummary: string;
}

export function normalizeHeadline(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function parseRssOrAtomFeed(
  xmlContent: string,
  sourceName: string
): Promise<DiscoveredFeedItem[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const parsed = parser.parse(xmlContent);
  const items: DiscoveredFeedItem[] = [];

  // RSS 2.0 Channel Items
  const rssItems = parsed?.rss?.channel?.item;
  const rawList = Array.isArray(rssItems) ? rssItems : rssItems ? [rssItems] : [];

  for (const item of rawList) {
    const title = String(item.title || '').trim();
    const link = String(item.link || '').trim();
    const description = String(item.description || item['content:encoded'] || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 600);

    if (!title || !link) continue;
    items.push({
      sourceName,
      originalTitle: title,
      normalizedTitle: normalizeHeadline(title),
      canonicalUrl: link.split('?utm_')[0],
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      factualSummary: description,
    });
  }

  return items;
}
