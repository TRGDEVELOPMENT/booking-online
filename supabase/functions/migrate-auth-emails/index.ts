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

    // Get all profiles with username set
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, username, company_id')
      .not('username', 'is', null)

    if (profilesError) throw profilesError

    const results = []
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })

    for (const profile of profiles || []) {
      // Use company-independent internal email
      const expectedEmail = `${profile.username}@app.internal`
      const authUser = authUsers?.find(u => u.id === profile.user_id)

      if (!authUser) {
        results.push({ username: profile.username, status: 'auth_user_not_found' })
        continue
      }

      if (authUser.email === expectedEmail) {
        results.push({ username: profile.username, status: 'already_correct' })
        continue
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        profile.user_id,
        { email: expectedEmail }
      )

      if (updateError) {
        results.push({ username: profile.username, old_email: authUser.email, status: 'error', error: updateError.message })
      } else {
        results.push({ username: profile.username, old_email: authUser.email, new_email: expectedEmail, status: 'migrated' })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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
