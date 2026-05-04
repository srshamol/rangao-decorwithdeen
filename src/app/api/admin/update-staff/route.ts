import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function POST(request: Request) {
  try {
    const { userId, email, username, fullName, role, phone, status } = await request.json();

    if (!userId || !email || !username || !fullName || !role || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Update Auth User (Email)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email,
      user_metadata: { full_name: fullName, username }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Update Staff Profile
    const { error: profileError } = await supabaseAdmin
      .from('staff_profiles')
      .update({
        full_name: fullName,
        email: email,
        username: username,
        phone: phone || null,
        status: status
      } as any)
      .eq('id', userId);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 3. Update Role (Delete old and insert new to be safe with constraints)
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role
      });

    if (roleError) {
       return NextResponse.json({ error: roleError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Staff update API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
