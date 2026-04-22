import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BranchSpec {
  company_id: string
  branch_id: string
  branch_label: string
}

const BRANCHES: BranchSpec[] = [
  { company_id: 'BPK', branch_id: 'BPK', branch_label: 'bpk' },
  { company_id: 'ICCK', branch_id: 'ICK', branch_label: 'ick' },
  { company_id: 'ICCK', branch_id: 'IKK', branch_label: 'ikk' },
  { company_id: 'LAC', branch_id: 'LRA', branch_label: 'lra' },
  { company_id: 'LAC', branch_id: 'LSV', branch_label: 'lsv' },
  { company_id: 'VPA', branch_id: 'VPA', branch_label: 'vpa' },
]

const BRANCH_ROLES = [
  { role: 'sale', key: 'sale', thaiName: 'ที่ปรึกษาการขาย' },
  { role: 'cashier', key: 'cashier', thaiName: 'แคชเชียร์' },
  { role: 'sale_supervisor', key: 'sup', thaiName: 'หัวหน้าทีมขาย' },
  { role: 'sale_manager', key: 'mgr', thaiName: 'ผู้จัดการฝ่ายขาย' },
]

const COMPANY_ADMIN_ROLES = [
  { role: 'user_admin', key: 'useradmin', thaiName: 'ผู้ดูแลระบบ' },
  { role: 'it', key: 'itadmin', thaiName: 'IT Admin' },
]

const PASSWORD = 'Test1234!'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const existingMap = new Map(existingUsers?.users?.map(u => [u.email, u]) ?? [])

    const results: Array<Record<string, unknown>> = []

    type UserPlan = {
      username: string
      full_name: string
      company_id: string
      branch_id: string | null
      role: string
    }

    const plans: UserPlan[] = []

    for (const b of BRANCHES) {
      for (const r of BRANCH_ROLES) {
        plans.push({
          username: `${r.key}_${b.branch_label}`,
          full_name: `${r.thaiName} ${b.branch_id}`,
          company_id: b.company_id,
          branch_id: b.branch_id,
          role: r.role,
        })
      }
    }

    const companyFirstBranch = new Map<string, string>()
    for (const b of BRANCHES) {
      if (!companyFirstBranch.has(b.company_id)) companyFirstBranch.set(b.company_id, b.branch_id)
    }
    for (const [company, branch] of companyFirstBranch) {
      for (const r of COMPANY_ADMIN_ROLES) {
        plans.push({
          username: `${r.key}_${company.toLowerCase()}`,
          full_name: `${r.thaiName} ${company}`,
          company_id: company,
          branch_id: branch,
          role: r.role,
        })
      }
    }

    for (const u of plans) {
      const internalEmail = `${u.username}@app.internal`
      const existing = existingMap.get(internalEmail)

      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, { password: PASSWORD })
        await supabase
          .from('profiles')
          .update({
            full_name: u.full_name,
            company_id: u.company_id,
            branch_id: u.branch_id,
            username: u.username,
          })
          .eq('user_id', existing.id)
        await supabase.from('user_roles').delete().eq('user_id', existing.id)
        await supabase.from('user_roles').insert({ user_id: existing.id, role: u.role })
        results.push({ username: u.username, status: 'updated' })
        continue
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: internalEmail,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: u.full_name,
          company_id: u.company_id,
          branch_id: u.branch_id,
          role: u.role,
          username: u.username,
        },
      })

      if (error) results.push({ username: u.username, status: 'error', error: error.message })
      else results.push({ username: u.username, status: 'created', user_id: data.user?.id })
    }

    return new Response(
      JSON.stringify({ success: true, count: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
