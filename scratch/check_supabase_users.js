const { createClient } = require('@supabase/supabase-js');

// These must be provided in the environment or hardcoded just for this script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dabihspsblbxplqzsfzq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // The user has SUPABASE_SERVICE_ROLE_KEY in .env.local

async function checkUser() {
  if (!supabaseKey) {
    console.error("No service role key provided in env, cannot fetch users securely.");
    return;
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  console.log("Supabase Auth Users:");
  users.users.forEach(u => {
    console.log(u.email, u.user_metadata);
  });
}

checkUser();
