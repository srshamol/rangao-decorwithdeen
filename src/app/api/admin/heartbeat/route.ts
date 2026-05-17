import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

function getAdminClient() {
  // Prefer the service role key (bypasses RLS); fall back to anon key so the
  // route doesn't hard-crash when SUPABASE_SERVICE_ROLE_KEY is not configured.
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const client = getAdminClient();

    // If we have no usable client (env vars completely missing) just return OK —
    // heartbeat is non-critical and should never cause a visible 500.
    if (!client) {
      console.warn('Heartbeat: Supabase credentials not configured — skipping DB sync.');
      return NextResponse.json({ success: true, skipped: true });
    }

    // Upsert staff profile — use upsert to avoid race conditions on first login.
    await client
      .from('staff_profiles')
      .upsert(
        {
          id: userId,
          full_name: userEmail?.split('@')[0] || 'Staff Member',
          email: userEmail || '',
          status: 'active',
          last_login: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );

    // Ensure a role row exists (INSERT only — don't overwrite existing role).
    const { data: existingRole } = await client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingRole) {
      await client.from('user_roles').insert({
        user_id: userId,
        role: userEmail === 'rangao.bd@gmail.com' ? 'super_admin' : 'production',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Log but never return 500 — heartbeat failures are non-critical.
    console.error('Heartbeat API error:', error?.message ?? error);
    return NextResponse.json({ success: false, warning: error?.message }, { status: 200 });
  }
}
