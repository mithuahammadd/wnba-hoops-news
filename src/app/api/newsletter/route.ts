import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const SubscribeSchema = z.object({
  email: z.string().email('Please enter a valid US or international email address.'),
  consentGranted: z.literal(true, {
    errorMap: () => ({ message: 'Editorial newsletter consent is required.' }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, consentGranted } = SubscribeSchema.parse(body);

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('newsletter_subscribers').insert({
      email: email.toLowerCase().trim(),
      consent_granted: consentGranted,
    });

    if (error && error.code !== '23505') {
      return NextResponse.json({ error: 'Unable to complete subscription.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: 'Welcome to the WNBA Hoops News Daily Shootaround newsletter.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
