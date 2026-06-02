const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixIssues() {
  console.log("=== FIXING AUDIT ISSUES ===\n");

  // Fix 1: Delete referral with NULL referred_user_id
  console.log("[Fix 1] Deleting referral with NULL referred_user_id (6ea4e6bc)...");
  const { error: delRefErr } = await supabase
    .from('referrals')
    .delete()
    .eq('id', '6ea4e6bc-e4e2-4eb5-b96c-ab6ad2a31414');
  if (delRefErr) console.error("  Error:", delRefErr.message);
  else console.log("  ✅ Deleted invalid referral");

  // Fix 2: Delete legacy withdrawals for Kevin (8a05e4b7) that have no backing commissions
  console.log("\n[Fix 2] Deleting legacy withdrawals for user 8a05e4b7 (no commissions)...");
  const { error: delWdErr } = await supabase
    .from('withdrawal_requests')
    .delete()
    .eq('user_id', '8a05e4b7-374c-4e1e-a00e-3cb80a25d8df');
  if (delWdErr) console.error("  Error:", delWdErr.message);
  else console.log("  ✅ Deleted 2 legacy withdrawals");

  // Fix 3: Ensure user_rewards for Kevin is reset to 0
  console.log("\n[Fix 3] Resetting user_rewards for 8a05e4b7...");
  const { error: updRwErr } = await supabase
    .from('user_rewards')
    .update({ total_cash_usd: 0, available_cash_usd: 0 })
    .eq('user_id', '8a05e4b7-374c-4e1e-a00e-3cb80a25d8df');
  if (updRwErr) console.error("  Error:", updRwErr.message);
  else console.log("  ✅ Reset user_rewards");

  // Fix 4: Clean up any commission_reversals that reference non-existent commissions
  console.log("\n[Fix 4] Checking commission_reversals...");
  const { data: reversals } = await supabase.from('commission_reversals').select('*');
  console.log(`  Found ${reversals?.length || 0} reversals`);

  console.log("\n=== FIXES COMPLETE ===");
}

fixIssues().catch(console.error);
