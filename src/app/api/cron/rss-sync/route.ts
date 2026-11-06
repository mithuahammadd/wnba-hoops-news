import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseRssOrAtomFeed } from '@/lib/automation/rss-ingestor';
import { generateArticleDraftWithGemini } from '@/lib/automation/gemini-drafter';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sources, error: sourcesErr } = await supabase
    .from('rss_sources')
    .select('*')
    .eq('is_enabled', true);

  if (sourcesErr || !sources) {
    return NextResponse.json({ error: 'Failed to load RSS sources' }, { status: 500 });
  }

  let discoveredCount = 0;
  let draftedCount = 0;

  for (const source of sources) {
    try {
      const res = await fetch(source.feed_url, { next: { revalidate: 0 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const items = await parseRssOrAtomFeed(xml, source.name);

      for (const item of items.slice(0, 5)) {
        // Deduplicate by canonical_url OR normalized_title
        const { data: existing } = await supabase
          .from('news_sources')
          .select('id')
          .or(`canonical_url.eq.${item.canonicalUrl},normalized_title.eq.${item.normalizedTitle}`)
          .maybeSingle();

        if (existing) continue;

        const { data: insertedSource, error: insertErr } = await supabase
          .from('news_sources')
          .insert({
            rss_source_id: source.id,
            source_name: item.sourceName,
            original_title: item.originalTitle,
            normalized_title: item.normalizedTitle,
            canonical_url: item.canonicalUrl,
            published_at: item.publishedAt,
            factual_summary: item.factualSummary,
          })
          .select()
          .single();

        if (insertErr || !insertedSource) continue;
        discoveredCount++;

        if (process.env.GEMINI_API_KEY) {
          const draft = await generateArticleDraftWithGemini(item);
          await supabase.from('news_drafts').insert({
            news_source_id: insertedSource.id,
            proposed_title: draft.proposedTitle,
            proposed_slug: draft.proposedSlug,
            excerpt: draft.excerpt,
            draft_content: draft.draftContent,
            seo_title: draft.seoTitle,
            meta_description: draft.metaDescription,
            suggested_category: draft.suggestedCategory,
            suggested_tags: draft.suggestedTags,
            source_urls: draft.sourceUrls,
            source_attribution: draft.sourceAttribution,
            needs_manual_research: draft.needsManualResearch,
            research_flag_reason: draft.researchFlagReason,
            status: 'pending_review',
          });
          draftedCount++;
        }
      }

      await supabase
        .from('rss_sources')
        .update({ last_synced_at: new Date().toISOString(), last_error: null })
        .eq('id', source.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown RSS sync error';
      await supabase
        .from('rss_sources')
        .update({ last_error: msg, last_synced_at: new Date().toISOString() })
        .eq('id', source.id);
    }
  }

  await supabase.from('automation_logs').insert({
    job_type: 'rss_sync',
    status: 'success',
    items_processed: discoveredCount,
    message: `Discovered ${discoveredCount} new stories; generated ${draftedCount} pending AI drafts for admin review.`,
  });

  return NextResponse.json({
    ok: true,
    discoveredCount,
    draftedCount,
    notice: 'All generated drafts saved as pending_review. Admin approval is required to publish.',
  });
}
