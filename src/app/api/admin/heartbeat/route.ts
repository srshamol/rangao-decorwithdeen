import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Update or Create profile with latest timestamp using admin privileges
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('staff_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profile) {
      // Update existing
      await supabaseAdmin
        .from('staff_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } else {
      // Provision missing profile - Using insert instead of upsert to avoid constraint errors
      await supabaseAdmin
        .from('staff_profiles')
        .insert({
          id: userId,
          full_name: userEmail?.split('@')[0] || "Staff Member",
          email: userEmail || "",
          status: 'active',
          last_login: new Date().toISOString()
        });
    }

    // Ensure role exists
    const { data: role } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!role) {
       await supabaseAdmin.from('user_roles').insert({
          user_id: userId,
          role: userEmail === 'rangao.bd@gmail.com' ? 'super_admin' : 'production'
       });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Heartbeat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
