import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName, role, phone, jobTitle, department, address, joiningDate, status } = await request.json();

    if (!email || !password || !username || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, username, job_title: jobTitle, department }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Create the Staff Profile
    const { error: profileError } = await supabaseAdmin
      .from('staff_profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        email: email,
        username: username,
        phone: phone || null,
        job_title: jobTitle || null,
        department: department || null,
        address: address || null,
        joining_date: joiningDate || null,
        status: status || 'active'
      } as any);

    if (profileError) {
      // Cleanup: Delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 3. Assign Role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role
      });

    if (roleError) {
       return NextResponse.json({ error: roleError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId });

  } catch (error: any) {
    console.error("Staff creation API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
