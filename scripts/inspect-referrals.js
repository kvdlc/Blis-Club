const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  console.log("=== CHECKING TABLES ===\n");

  // Check referral_commissions
  const { data: rc, error: rcErr } = await supabase
    .from('referral_commissions')
    .select('*')
    .limit(1);
  console.log("referral_commissions sample:", rc ? rc[0] : null, "Error:", rcErr?.message);

  // Check user_rewards
  const { data: ur, error: urErr } = await supabase
    .from('user_rewards')
    .select('*')
    .limit(1);
  console.log("user_rewards sample:", ur ? ur[0] : null, "Error:", urErr?.message);

  // Check withdrawal_requests
  const { data: wr, error: wrErr } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .limit(1);
  console.log("withdrawal_requests sample:", wr ? wr[0] : null, "Error:", wrErr?.message);

  // Check referrals
  const { data: r, error: rErr } = await supabase
    .from('referrals')
    .select('*')
    .limit(1);
  console.log("referrals sample:", r ? r[0] : null, "Error:", rErr?.message);

  // Check billing_profiles
  const { data: bp, error: bpErr } = await supabase
    .from('billing_profiles')
    .select('*')
    .limit(1);
  console.log("billing_profiles sample:", bp ? bp[0] : null, "Error:", bpErr?.message);

  // Count rows
  const { count: rcCount } = await supabase.from('referral_commissions').select('*', { count: 'exact', head: true });
  const { count: urCount } = await supabase.from('user_rewards').select('*', { count: 'exact', head: true });
  const { count: wrCount } = await supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true });
  const { count: rCount } = await supabase.from('referrals').select('*', { count: 'exact', head: true });
  const { count: bpCount } = await supabase.from('billing_profiles').select('*', { count: 'exact', head: true });

  console.log("\n=== ROW COUNTS ===");
  console.log("referral_commissions:", rcCount);
  console.log("user_rewards:", urCount);
  console.log("withdrawal_requests:", wrCount);
  console.log("referrals:", rCount);
  console.log("billing_profiles:", bpCount);

  // Test relations
  console.log("\n=== TESTING RELATIONS ===");

  const { data: rcRel, error: rcRelErr } = await supabase
    .from('referral_commissions')
    .select('*, referrer:profiles!user_id(id, email)')
    .limit(1);
  console.log("referral_commissions -> profiles relation:", rcRelErr ? "ERROR: " + rcRelErr.message : "OK", rcRel?.[0]?.referrer);

  const { data: wrRel, error: wrRelErr } = await supabase
    .from('withdrawal_requests')
    .select('*, profile:profiles!user_id(id, email)')
    .limit(1);
  console.log("withdrawal_requests -> profiles relation:", wrRelErr ? "ERROR: " + wrRelErr.message : "OK", wrRel?.[0]?.profile);

  const { data: bpRel, error: bpRelErr } = await supabase
    .from('withdrawal_requests')
    .select('*, billing:billing_profiles!billing_profile_id(*)')
    .limit(1);
  console.log("withdrawal_requests -> billing_profiles relation:", bpRelErr ? "ERROR: " + bpRelErr.message : "OK", bpRel?.[0]?.billing);
}

inspect().catch(console.error);
