import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Verify the calling user is user_admin or it
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callingUser }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check caller has user_admin or it role
    const { data: callerRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)

    const allowedRoles = ['user_admin', 'it']
    const hasPermission = callerRoles?.some(r => allowedRoles.includes(r.role))
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Forbidden: insufficient role' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { action } = body

    // Handle role update
    if (action === 'update_role') {
      const { user_id, role } = body
      if (!user_id || !role) {
        return new Response(JSON.stringify({ error: 'Missing user_id or role' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Delete existing roles
      await supabase.from('user_roles').delete().eq('user_id', user_id)

      // Insert new role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id, role })

      if (roleError) {
        return new Response(JSON.stringify({ error: roleError.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default: create user
    const { username, password, full_name, company_id, branch_id, role, supervisor_id, email: contactEmail } = body

    if (!username || !password || !full_name || !company_id || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if username already exists in this company
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .eq('company_id', company_id)
      .maybeSingle()

    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'รหัสพนักงานนี้ถูกใช้งานแล้วในบริษัทนี้' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate internal email for Supabase Auth (username@company.internal)
    const internalEmail = `${username}@${company_id.toLowerCase()}.internal`

    // Create user via admin API using internal email
    const { data, error } = await supabase.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        company_id,
        branch_id: branch_id || null,
        role,
        username,
        contact_email: contactEmail || null,
      },
    })

    if (error) {
      // Handle duplicate internal email (user already exists)
      if (error.message.includes('already been registered')) {
        return new Response(JSON.stringify({ error: 'รหัสพนักงานนี้ถูกใช้งานแล้ว' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update supervisor_id if provided (for sale role)
    if (data.user) {
      const updates: Record<string, unknown> = {}
      if (supervisor_id) updates.supervisor_id = supervisor_id
      
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', data.user.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, user_id: data.user?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
