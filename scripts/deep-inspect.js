const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deepInspect() {
  // Check all rows in referral_commissions to see available_after values
  const { data: rcAll } = await supabase.from('referral_commissions').select('id, available_after, status, created_at');
  console.log("referral_commissions available_after values:", rcAll?.map(r => ({ id: r.id.substring(0,8), status: r.status, created_at: r.created_at, available_after: r.available_after })));

  // Try querying withdrawal_requests with the broken relation to see error
  const { data: wrBroken, error: wrBrokenErr } = await supabase
    .from('withdrawal_requests')
    .select('*, billing:billing_profile_id(*)')
    .limit(1);
  console.log("\nwithdrawal_requests with broken relation:", wrBrokenErr ? "ERROR: " + wrBrokenErr.message : "OK", wrBroken);

  // Try with corrected relation syntax
  const { data: wrFixed, error: wrFixedErr } = await supabase
    .from('withdrawal_requests')
    .select('*, billing:billing_profiles!billing_profile_id(*)')
    .limit(1);
  console.log("withdrawal_requests with fixed relation:", wrFixedErr ? "ERROR: " + wrFixedErr.message : "OK", wrFixed);

  // Check user_rewards values
  const { data: urAll } = await supabase.from('user_rewards').select('*');
  console.log("\nuser_rewards all rows:", urAll?.map(u => ({ user_id: u.user_id.substring(0,8), total_cash_usd: u.total_cash_usd, available_cash_usd: u.available_cash_usd })));

  // Check all commissions
  const { data: rcFull } = await supabase.from('referral_commissions').select('*');
  console.log("\nAll referral_commissions:", rcFull?.map(c => ({ user_id: c.user_id.substring(0,8), referral_id: c.referral_id.substring(0,8), commission_cents: c.commission_cents, status: c.status, available_after: c.available_after })));
}

deepInspect().catch(console.error);
