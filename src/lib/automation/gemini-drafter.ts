import { GoogleGenerativeAI } from '@google/generative-ai';
import { DiscoveredFeedItem } from './rss-ingestor';

export interface GeneratedDraftPayload {
  proposedTitle: string;
  proposedSlug: string;
  excerpt: string;
  draftContent: string;
  seoTitle: string;
  metaDescription: string;
  suggestedCategory: string;
  suggestedTags: string[];
  sourceAttribution: string;
  sourceUrls: string[];
  needsManualResearch: boolean;
  researchFlagReason: string | null;
}

/**
 * Generates an original American English news draft strictly grounded in the
 * discovered RSS metadata. Never auto-publishes and flags insufficient sources.
 */
export async function generateArticleDraftWithGemini(
  item: DiscoveredFeedItem
): Promise<GeneratedDraftPayload> {
  const wordCount = item.factualSummary.split(/\s+/).filter(Boolean).length;
  const insufficientContext = wordCount < 18;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Use the manual draft creation workflow in /admin.'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
  });

  const prompt = `
You are a senior WNBA sports desk editor at WNBA Hoops News writing in professional American English.
Your task is to write an original news brief strictly based on the following verified source metadata.

STRICT EDITORIAL RULES:
1. NEVER fabricate quotes, scores, player injuries, trade terms, statistics, or official statements.
2. NEVER copy complete copyrighted sentences from the source.
3. Explicitly attribute the original reporting to "${item.sourceName}" (${item.canonicalUrl}).
4. Never state a rumor is confirmed unless explicitly stated in the factual summary.
5. If the factual summary lacks sufficient detail for a complete report, set "needsManualResearch": true and explain what facts an editor must verify in "researchFlagReason".

SOURCE METADATA:
- Source Name: ${item.sourceName}
- Original Headline: ${item.originalTitle}
- Source URL: ${item.canonicalUrl}
- Published At: ${item.publishedAt}
- Factual Summary: ${item.factualSummary}

Return a JSON object with keys:
"proposedTitle", "proposedSlug", "excerpt", "draftContent", "seoTitle", "metaDescription",
"suggestedCategory", "suggestedTags" (array of strings), "needsManualResearch" (boolean), "researchFlagReason" (string or null).
`;

  const response = await model.generateContent(prompt);
  const parsed = JSON.parse(response.response.text());

  return {
    proposedTitle: parsed.proposedTitle,
    proposedSlug: parsed.proposedSlug,
    excerpt: parsed.excerpt,
    draftContent: parsed.draftContent,
    seoTitle: parsed.seoTitle,
    metaDescription: parsed.metaDescription,
    suggestedCategory: parsed.suggestedCategory || 'League News',
    suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['WNBA'],
    sourceAttribution: `Original reporting via ${item.sourceName}`,
    sourceUrls: [item.canonicalUrl],
    needsManualResearch: Boolean(parsed.needsManualResearch || insufficientContext),
    researchFlagReason:
      parsed.researchFlagReason ||
      (insufficientContext
        ? 'Source feed summary contained fewer than 18 words; manual verification required before approval.'
        : null),
  };
}
