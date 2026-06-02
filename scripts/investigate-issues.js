const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateIssues() {
  console.log("=== INVESTIGATING ISSUES ===\n");

  // Issue 1: Referral with NULL referred_user_id
  console.log("[Issue 1] Referral 6ea4e6bc with NULL referred_user_id:");
  const { data: badRef } = await supabase.from('referrals').select('*').eq('id', '6ea4e6bc-e4e2-4eb5-b96c-ab6ad2a31414').single();
  console.log(JSON.stringify(badRef, null, 2));

  // Issue 2: Kevin's overdraft
  console.log("\n[Issue 2] Kevin's (8a05e4b7) withdrawal and commissions:");
  const { data: kevinWithdrawals } = await supabase.from('withdrawal_requests').select('*').eq('user_id', '8a05e4b7-374c-4e1e-a00e-3cb80a25d8df');
  console.log("Withdrawals:", kevinWithdrawals);

  const { data: kevinCommissions } = await supabase.from('referral_commissions').select('*').eq('user_id', '8a05e4b7-374c-4e1e-a00e-3cb80a25d8df');
  console.log("Commissions:", kevinCommissions);

  const { data: kevinReferrals } = await supabase.from('referrals').select('*').eq('referrer_user_id', '8a05e4b7-374c-4e1e-a00e-3cb80a25d8df');
  console.log("Referrals where Kevin is referrer:", kevinReferrals);

  // Check all users with NULL referred_user_id
  console.log("\n[Issue 3] All referrals with NULL referred_user_id:");
  const { data: nullRefs } = await supabase.from('referrals').select('*').is('referred_user_id', null);
  console.log(nullRefs);

  // Check if 1830d1ed (the root referrer) has a referral record (who referred him?)
  console.log("\n[Issue 4] Who referred 1830d1ed (Carlos/Demo)?");
  const { data: carlosReferrer } = await supabase.from('referrals').select('*').eq('referred_user_id', '1830d1ed-ef20-4f27-82ad-2a49744124f9');
  console.log(carlosReferrer);

  // Check all users with active subscriptions but who referred them
  console.log("\n[Issue 5] Subscription -> Referral mapping:");
  const { data: subs } = await supabase.from('subscriptions').select('user_id, status');
  for (const s of subs || []) {
    const ref = (await supabase.from('referrals').select('id, referrer_user_id, referred_user_id, status').eq('referred_user_id', s.user_id).maybeSingle()).data;
    console.log(`User ${s.user_id.substring(0,8)}: sub=${s.status}, referral=${ref ? 'YES (referrer=' + ref.referrer_user_id?.substring(0,8) + ')' : 'NO'}`);
  }
}

investigateIssues().catch(console.error);
