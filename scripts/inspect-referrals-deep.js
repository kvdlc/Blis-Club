const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectReferrals() {
  // Check all commissions values
  const { data: comms } = await supabase.from('referral_commissions').select('*');
  console.log("=== ALL COMMISSIONS ===");
  for (const c of comms || []) {
    console.log(`ID:${c.id.substring(0,8)} user:${c.user_id.substring(0,8)} level:${c.level} commission_cents:${c.commission_cents} status:${c.status}`);
  }

  // Check all referrals
  const { data: refs } = await supabase.from('referrals').select('*');
  console.log("\n=== ALL REFERRALS ===");
  for (const r of refs || []) {
    console.log(`ID:${r.id.substring(0,8)} referrer:${r.referrer_user_id?.substring(0,8)} referred:${r.referred_user_id?.substring(0,8) || 'NULL'} level:${r.level} status:${r.status} cash_reward:${r.cash_reward_usd}`);
  }

  // Check subscriptions
  const { data: subs } = await supabase.from('subscriptions').select('*').limit(20);
  console.log("\n=== SUBSCRIPTIONS ===");
  for (const s of subs || []) {
    console.log(`user:${s.user_id?.substring(0,8)} status:${s.status} period_end:${s.current_period_end} created:${s.created_at}`);
  }

  // Check if there's any commission_reversals
  const { data: revs } = await supabase.from('commission_reversals').select('*');
  console.log("\n=== COMMISSION REVERSALS ===");
  console.log(revs?.length || 0, "rows");
  for (const r of revs || []) {
    console.log(r);
  }
}

inspectReferrals().catch(console.error);
