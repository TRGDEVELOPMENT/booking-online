import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestUser {
  email: string;
  password: string;
  full_name: string;
  company_id: string;
  role: string;
}

const testUsers: TestUser[] = [
  {
    email: 'sale@test.com',
    password: 'Test1234!',
    full_name: 'สมชาย ใจดี',
    company_id: 'BPK',
    role: 'sale',
  },
  {
    email: 'cashier@test.com',
    password: 'Test1234!',
    full_name: 'สมหญิง รักเงิน',
    company_id: 'BPK',
    role: 'cashier',
  },
  {
    email: 'supervisor@test.com',
    password: 'Test1234!',
    full_name: 'สมศักดิ์ นำทีม',
    company_id: 'LAC',
    role: 'sale_supervisor',
  },
  {
    email: 'manager@test.com',
    password: 'Test1234!',
    full_name: 'สมปอง บริหาร',
    company_id: 'ICCK',
    role: 'sale_manager',
  },
  {
    email: 'it@test.com',
    password: 'Test1234!',
    full_name: 'สมเกียรติ ไอที',
    company_id: 'VPA',
    role: 'it',
  },
];

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
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === user.email)
      
      if (existingUser) {
        // Update password for existing user
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: user.password }
        )
        
        if (updateError) {
          results.push({ email: user.email, status: 'update error', error: updateError.message })
        } else {
          results.push({ email: user.email, status: 'password updated', userId: existingUser.id })
        }
        continue
      }

      // Create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          company_id: user.company_id,
          role: user.role,
        },
      })

      if (error) {
        results.push({ email: user.email, status: 'error', error: error.message })
      } else {
        results.push({ email: user.email, status: 'created', userId: data.user?.id })
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
