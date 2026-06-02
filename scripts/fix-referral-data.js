const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixData() {
  // 1. Update all commissions with null available_after to created_at + 14 days
  console.log("Fixing available_after for referral_commissions...");
  const { data: commissions, error: fetchErr } = await supabase
    .from('referral_commissions')
    .select('id, created_at, available_after')
    .is('available_after', null);

  if (fetchErr) {
    console.error("Error fetching commissions:", fetchErr.message);
    return;
  }

  console.log(`Found ${commissions?.length || 0} commissions with null available_after`);

  for (const c of commissions || []) {
    const created = new Date(c.created_at);
    created.setDate(created.getDate() + 14);
    const availableAfter = created.toISOString();

    const { error } = await supabase
      .from('referral_commissions')
      .update({ available_after: availableAfter })
      .eq('id', c.id);

    if (error) {
      console.error(`Failed to update commission ${c.id}:`, error.message);
    } else {
      console.log(`Updated commission ${c.id.substring(0,8)}: available_after = ${availableAfter}`);
    }
  }

  // 2. Check if billing_profiles table exists
  console.log("\nChecking billing_profiles table...");
  const { data: bp, error: bpErr } = await supabase.from('billing_profiles').select('id').limit(1);
  if (bpErr) {
    console.log("billing_profiles table error:", bpErr.message);
    console.log("billing_profiles table likely does NOT exist. You must create it via SQL Editor.");
  } else {
    console.log("billing_profiles table exists. Counting rows...");
    const { count } = await supabase.from('billing_profiles').select('*', { count: 'exact', head: true });
    console.log("billing_profiles rows:", count);
  }

  // 3. Verify withdrawal_requests columns
  console.log("\nVerifying withdrawal_requests columns...");
  const { data: wrSample } = await supabase.from('withdrawal_requests').select('*').limit(1);
  console.log("withdrawal_requests columns present:", wrSample && wrSample[0] ? Object.keys(wrSample[0]) : "none");
}

fixData().catch(console.error);
