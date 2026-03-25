import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestUser {
  username: string;
  password: string;
  full_name: string;
  company_id: string;
  role: string;
}

const testUsers: TestUser[] = [
  {
    username: 'sale',
    password: 'Test1234!',
    full_name: 'สมชาย ใจดี',
    company_id: 'BPK',
    role: 'sale',
  },
  {
    username: 'cashier',
    password: 'Test1234!',
    full_name: 'สมหญิง รักเงิน',
    company_id: 'BPK',
    role: 'cashier',
  },
  {
    username: 'supervisor',
    password: 'Test1234!',
    full_name: 'สมศักดิ์ นำทีม',
    company_id: 'BPK',
    role: 'sale_supervisor',
  },
  {
    username: 'manager',
    password: 'Test1234!',
    full_name: 'สมปอง บริหาร',
    company_id: 'BPK',
    role: 'sale_manager',
  },
  {
    username: 'itadmin',
    password: 'Test1234!',
    full_name: 'สมเกียรติ ไอที',
    company_id: 'BPK',
    role: 'it',
  },
  {
    username: 'useradmin',
    password: 'Test1234!',
    full_name: 'สมพร ดูแลระบบ',
    company_id: 'BPK',
    role: 'user_admin',
  },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results = []

    for (const user of testUsers) {
      const internalEmail = `${user.username}@${user.company_id.toLowerCase()}.internal`

      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === internalEmail)
      
      if (existingUser) {
        // Update password for existing user
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: user.password }
        )

        // Update username in profile if missing
        await supabase
          .from('profiles')
          .update({ username: user.username })
          .eq('user_id', existingUser.id)
          .is('username', null)
        
        if (updateError) {
          results.push({ username: user.username, status: 'update error', error: updateError.message })
        } else {
          results.push({ username: user.username, status: 'password updated', userId: existingUser.id })
        }
        continue
      }

      // Also check by old email format (migration from email-based)
      const oldEmail = (() => {
        const oldMap: Record<string, string> = {
          sale: 'sale@test.com',
          cashier: 'cashier@test.com',
          supervisor: 'supervisor@test.com',
          manager: 'manager@test.com',
          itadmin: 'it@test.com',
          useradmin: 'useradmin@test.com',
        }
        return oldMap[user.username]
      })()

      if (oldEmail) {
        const oldUser = existingUsers?.users?.find(u => u.email === oldEmail)
        if (oldUser) {
          // Update existing user to new internal email
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            oldUser.id,
            { email: internalEmail, password: user.password }
          )

          // Update profile with username
          await supabase
            .from('profiles')
            .update({ username: user.username })
            .eq('user_id', oldUser.id)

          if (updateError) {
            results.push({ username: user.username, status: 'migration error', error: updateError.message })
          } else {
            results.push({ username: user.username, status: 'migrated from email', userId: oldUser.id })
          }
          continue
        }
      }

      // Create user with internal email
      const { data, error } = await supabase.auth.admin.createUser({
        email: internalEmail,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          company_id: user.company_id,
          role: user.role,
          username: user.username,
        },
      })

      if (error) {
        results.push({ username: user.username, status: 'error', error: error.message })
      } else {
        results.push({ username: user.username, status: 'created', userId: data.user?.id })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
