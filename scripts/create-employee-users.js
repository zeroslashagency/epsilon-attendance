// Script to create employee user accounts in Supabase Auth
// Run this script to create user accounts for employees

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxnaopzgaddvziplrlbe.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // You'll need to get this from Supabase Dashboard > Settings > API

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Employee data to create accounts for
const employees = [
  { code: '16', name: 'Kannan', email: 'kannan@company.com', password: 'Kannan@2024' },
  { code: '19', name: 'Prabhu Manoj', email: 'prabhumanoj@company.com', password: 'Prabhu@2024' },
  { code: '1', name: 'Nandhini', email: 'nandhini@company.com', password: 'Nandhini@2024' },
  { code: '12', name: 'Deepak', email: 'deepak@company.com', password: 'Deepak@2024' },
  { code: '17', name: 'Mohammed Yasique', email: 'mohammedyasique@company.com', password: 'Yasique@2024' }
]

async function createEmployeeUsers() {
  console.log('🚀 Starting employee user creation...')
  
  for (const employee of employees) {
    try {
      console.log(`\n📝 Creating user for ${employee.name} (${employee.code})...`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: employee.email,
        password: employee.password,
        email_confirm: true,
        user_metadata: {
          employee_code: employee.code,
          employee_name: employee.name,
          role: 'employee'
        }
      })

      if (authError) {
        console.error(`❌ Auth creation failed for ${employee.name}:`, authError.message)
        continue
      }

      console.log(`✅ Auth user created for ${employee.name}`)

      // Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: employee.email,
          full_name: employee.name,
          role: employee.code // Using role field to store employee_code temporarily
        })

      if (profileError) {
        console.error(`❌ Profile creation failed for ${employee.name}:`, profileError.message)
        continue
      }

      console.log(`✅ Profile created for ${employee.name}`)

      // Create auth mapping
      const { error: mappingError } = await supabase
        .from('employee_auth_mapping')
        .insert({
          employee_code: employee.code,
          auth_user_id: authData.user.id,
          role: 'employee'
        })

      if (mappingError) {
        console.error(`❌ Mapping creation failed for ${employee.name}:`, mappingError.message)
        continue
      }

      console.log(`✅ Auth mapping created for ${employee.name}`)
      console.log(`🎉 Successfully created account for ${employee.name} (${employee.code})`)
      console.log(`   Email: ${employee.email}`)
      console.log(`   Password: ${employee.password}`)

    } catch (error) {
      console.error(`❌ Unexpected error for ${employee.name}:`, error.message)
    }
  }
  
  console.log('\n🏁 Employee user creation completed!')
}

// Run the script
createEmployeeUsers().catch(console.error)


