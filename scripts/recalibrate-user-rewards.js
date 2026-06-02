const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recalibrateUserRewards() {
  console.log("=== RECALIBRATING user_rewards FROM referral_commissions ===\n");

  // 1. Get all commissions grouped by user
  const { data: commissions, error: commErr } = await supabase
    .from('referral_commissions')
    .select('user_id, commission_cents, status');

  if (commErr) {
    console.error("Error fetching commissions:", commErr.message);
    return;
  }

  // Group by user
  const userMap = {};
  for (const c of commissions || []) {
    const uid = c.user_id;
    if (!userMap[uid]) userMap[uid] = { total: 0, available: 0, pending: 0, paid_out: 0 };
    userMap[uid].total += c.commission_cents;
    if (c.status === 'available') userMap[uid].available += c.commission_cents;
    if (c.status === 'pending') userMap[uid].pending += c.commission_cents;
    if (c.status === 'paid_out') userMap[uid].paid_out += c.commission_cents;
  }

  console.log(`Found ${Object.keys(userMap).length} users with commissions`);

  // 2. Upsert user_rewards for each user
  for (const [userId, stats] of Object.entries(userMap)) {
    const { data: existing } = await supabase
      .from('user_rewards')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('user_rewards')
        .update({
          total_cash_usd: stats.total,
          available_cash_usd: stats.available,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error(`Failed to update ${userId}:`, error.message);
      } else {
        console.log(`Updated ${userId.substring(0,8)}: total=${stats.total}c ($${(stats.total/100).toFixed(2)}), available=${stats.available}c ($${(stats.available/100).toFixed(2)})`);
      }
    } else {
      const { error } = await supabase
        .from('user_rewards')
        .insert({
          user_id: userId,
          total_cash_usd: stats.total,
          available_cash_usd: stats.available,
        });

      if (error) {
        console.error(`Failed to insert ${userId}:`, error.message);
      } else {
        console.log(`Inserted ${userId.substring(0,8)}: total=${stats.total}c ($${(stats.total/100).toFixed(2)})`);
      }
    }
  }

  // 3. Reset user_rewards for users with NO commissions
  const { data: allRewards } = await supabase.from('user_rewards').select('user_id, total_cash_usd');
  let resetCount = 0;
  for (const row of allRewards || []) {
    if (!userMap[row.user_id]) {
      await supabase.from('user_rewards').update({ total_cash_usd: 0, available_cash_usd: 0 }).eq('user_id', row.user_id);
      if ((row.total_cash_usd || 0) > 0) {
        console.log(`Reset ${row.user_id.substring(0,8)} to $0.00 (no commissions found)`);
        resetCount++;
      }
    }
  }
  console.log(`\nReset ${resetCount} users with no commissions`);
  console.log("\n=== RECALIBRATION COMPLETE ===");
}

recalibrateUserRewards().catch(console.error);
