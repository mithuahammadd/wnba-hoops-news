import { createSupabaseServerClient } from './supabase/server';

export async function requireAdminRole() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !['admin', 'editor'].includes(profile.role)) {
    throw new Error('Forbidden: Administrator or Editor role required');
  }

  return profile;
}
