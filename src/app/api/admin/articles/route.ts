import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRole } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ArticleSchema = z.object({
  title: z.string().min(8).max(180),
  slug: z.string().min(4).max(180),
  excerpt: z.string().min(20).max(400),
  content: z.string().min(50),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'scheduled', 'published', 'rejected']),
  is_featured: z.boolean().default(false),
  is_breaking: z.boolean().default(false),
  seo_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  source_attribution: z.string().optional(),
  original_source_url: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminRole();
    const json = await request.json();
    const payload = ArticleSchema.parse(json);

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('articles')
      .insert({
        ...payload,
        author_id: admin.id,
        author_name: admin.full_name,
        published_at: payload.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ article: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized or invalid payload';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
