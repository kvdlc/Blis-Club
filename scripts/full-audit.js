const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fullAudit() {
  console.log("========================================");
  console.log("  COMPREHENSIVE REFERRAL SYSTEM AUDIT");
  console.log("========================================\n");

  let issues = 0;

  // 1. Get all commissions
  const { data: commissions } = await supabase.from('referral_commissions').select('*');
  console.log(`1. Total commissions in DB: ${commissions?.length || 0}`);

  // 2. Get all user_rewards
  const { data: rewards } = await supabase.from('user_rewards').select('*');
  console.log(`2. Total user_rewards rows: ${rewards?.length || 0}`);

  // 3. Get all referrals
  const { data: referrals } = await supabase.from('referrals').select('*');
  console.log(`3. Total referrals: ${referrals?.length || 0}`);

  // 4. Get all withdrawal_requests
  const { data: withdrawals } = await supabase.from('withdrawal_requests').select('*');
  console.log(`4. Total withdrawals: ${withdrawals?.length || 0}`);

  // 5. Get all subscriptions
  const { data: subscriptions } = await supabase.from('subscriptions').select('*');
  console.log(`5. Total subscriptions: ${subscriptions?.length || 0}`);

  // 6. Get all profiles
  const { data: profiles } = await supabase.from('profiles').select('id, email');
  console.log(`6. Total profiles: ${profiles?.length || 0}`);

  // 7. Get all billing_profiles
  const { data: billingProfiles } = await supabase.from('billing_profiles').select('*');
  console.log(`7. Total billing_profiles: ${billingProfiles?.length || 0}`);

  // 8. Get user_reward_transactions
  const { data: transactions } = await supabase.from('user_reward_transactions').select('*');
  console.log(`8. Total transactions (ledger): ${transactions?.length || 0}`);

  console.log("\n========================================");
  console.log("  AUDIT CHECKS");
  console.log("========================================\n");

  // CHECK A: user_rewards vs commissions
  console.log("[A] user_rewards vs referral_commissions consistency");
  const userCommissionTotals = {};
  for (const c of commissions || []) {
    if (!userCommissionTotals[c.user_id]) userCommissionTotals[c.user_id] = 0;
    userCommissionTotals[c.user_id] += c.commission_cents;
  }
  for (const r of rewards || []) {
    const expectedTotal = userCommissionTotals[r.user_id] || 0;
    if (r.total_cash_usd !== expectedTotal) {
      console.log(`  ❌ MISMATCH: user ${r.user_id.substring(0,8)} total_cash_usd=${r.total_cash_usd} but commissions sum=${expectedTotal}`);
      issues++;
    }
  }
  for (const uid of Object.keys(userCommissionTotals)) {
    const reward = (rewards || []).find(r => r.user_id === uid);
    if (!reward) {
      console.log(`  ❌ MISSING: user ${uid.substring(0,8)} has ${userCommissionTotals[uid]}c in commissions but NO user_rewards row`);
      issues++;
    }
  }
  if (issues === 0) console.log("  ✅ All user_rewards match commission totals");

  // CHECK B: available_cash_usd vs available commissions
  console.log("\n[B] available_cash_usd vs 'available' commissions");
  let bIssues = 0;
  const userAvailableTotals = {};
  for (const c of commissions || []) {
    if (c.status === 'available') {
      if (!userAvailableTotals[c.user_id]) userAvailableTotals[c.user_id] = 0;
      userAvailableTotals[c.user_id] += c.commission_cents;
    }
  }
  for (const r of rewards || []) {
    const expectedAvailable = userAvailableTotals[r.user_id] || 0;
    if (r.available_cash_usd !== expectedAvailable) {
      console.log(`  ❌ MISMATCH: user ${r.user_id.substring(0,8)} available=${r.available_cash_usd} but available commissions=${expectedAvailable}`);
      bIssues++;
    }
  }
  if (bIssues === 0) console.log("  ✅ All available balances match");
  issues += bIssues;

  // CHECK C: pending commissions with past available_after
  console.log("\n[C] Pending commissions with expired available_after");
  let cIssues = 0;
  const now = new Date();
  for (const c of commissions || []) {
    if (c.status === 'pending' && c.available_after) {
      const availableDate = new Date(c.available_after);
      if (availableDate < now) {
        console.log(`  ❌ EXPIRED HOLD: commission ${c.id.substring(0,8)} available_after=${c.available_after} but status is still 'pending'`);
        cIssues++;
      }
    }
  }
  if (cIssues === 0) console.log("  ✅ No expired pending commissions");
  issues += cIssues;

  // CHECK D: referrals with NULL referred_user_id
  console.log("\n[D] Referrals with NULL referred_user_id");
  let dIssues = 0;
  for (const r of referrals || []) {
    if (!r.referred_user_id) {
      console.log(`  ❌ NULL referred_user_id: referral ${r.id.substring(0,8)} referrer=${r.referrer_user_id?.substring(0,8)}`);
      dIssues++;
    }
  }
  if (dIssues === 0) console.log("  ✅ All referrals have referred_user_id");
  issues += dIssues;

  // CHECK E: referrals with inconsistent level
  console.log("\n[E] Referrals with inconsistent level");
  let eIssues = 0;
  for (const r of referrals || []) {
    // Check if referrer exists as a referred_user in another referral
    const parentReferral = (referrals || []).find(parent => parent.referred_user_id === r.referrer_user_id);
    const expectedLevel = parentReferral ? (parentReferral.level || 1) + 1 : 1;
    if ((r.level || 1) !== expectedLevel) {
      console.log(`  ⚠️ LEVEL MISMATCH: referral ${r.id.substring(0,8)} has level=${r.level} but expected=${expectedLevel}`);
      eIssues++;
    }
  }
  if (eIssues === 0) console.log("  ✅ All referral levels consistent");
  else console.log(`  (Note: ${eIssues} level mismatches - may be expected for complex trees)`);

  // CHECK F: Withdrawals exceeding available balance
  console.log("\n[F] Withdrawals exceeding available balance");
  let fIssues = 0;
  const userWithdrawnTotals = {};
  for (const w of withdrawals || []) {
    if (w.status === 'completed' || w.status === 'pending' || w.status === 'processing') {
      if (!userWithdrawnTotals[w.user_id]) userWithdrawnTotals[w.user_id] = 0;
      userWithdrawnTotals[w.user_id] += w.amount_usd;
    }
  }
  for (const uid of Object.keys(userWithdrawnTotals)) {
    const reward = (rewards || []).find(r => r.user_id === uid);
    const available = reward?.available_cash_usd || 0;
    // Also add pending commissions to available for this check
    const userPendingComms = (commissions || []).filter(c => c.user_id === uid && c.status === 'pending').reduce((sum, c) => sum + c.commission_cents, 0);
    const maxPossible = (reward?.total_cash_usd || 0);
    if (userWithdrawnTotals[uid] > maxPossible) {
      console.log(`  ❌ OVERDRAFT: user ${uid.substring(0,8)} withdrawn=${userWithdrawnTotals[uid]} but max earned=${maxPossible}`);
      fIssues++;
    }
  }
  if (fIssues === 0) console.log("  ✅ No overdrafts detected");
  issues += fIssues;

  // CHECK G: Subscriptions without referrals
  console.log("\n[G] Subscriptions without referral record");
  let gIssues = 0;
  for (const s of subscriptions || []) {
    const hasReferral = (referrals || []).some(r => r.referred_user_id === s.user_id);
    if (!hasReferral) {
      console.log(`  ⚠️ NO REFERRAL: subscription for user ${s.user_id?.substring(0,8)} has no referral record`);
      gIssues++;
    }
  }
  if (gIssues === 0) console.log("  ✅ All subscriptions have referrals");
  else console.log(`  (Note: ${gIssues} subscriptions without referrals - users may have signed up organically)`);

  // CHECK H: Commissions without matching referral
  console.log("\n[H] Commissions without matching referral");
  let hIssues = 0;
  for (const c of commissions || []) {
    const matchingReferral = (referrals || []).find(r => r.id === c.referral_id);
    if (!matchingReferral) {
      console.log(`  ❌ ORPHAN: commission ${c.id.substring(0,8)} points to non-existent referral ${c.referral_id?.substring(0,8)}`);
      hIssues++;
    }
  }
  if (hIssues === 0) console.log("  ✅ All commissions link to valid referrals");
  issues += hIssues;

  // CHECK I: Duplicate commission for same referral+period
  console.log("\n[I] Duplicate commissions (same user, referral, amount, within 1 hour)");
  let iIssues = 0;
  const commissionKeyMap = {};
  for (const c of commissions || []) {
    const key = `${c.user_id}_${c.referral_id}_${c.commission_cents}`;
    if (commissionKeyMap[key]) {
      const existing = commissionKeyMap[key];
      const timeDiff = Math.abs(new Date(c.created_at).getTime() - new Date(existing.created_at).getTime());
      if (timeDiff < 3600000) { // 1 hour
        console.log(`  ⚠️ DUPLICATE: user ${c.user_id.substring(0,8)} has duplicate ${c.commission_cents}c commission on referral ${c.referral_id?.substring(0,8)}`);
        iIssues++;
      }
    } else {
      commissionKeyMap[key] = c;
    }
  }
  if (iIssues === 0) console.log("  ✅ No suspicious duplicates");

  // CHECK J: Billing profiles without matching user
  console.log("\n[J] Billing profiles consistency");
  let jIssues = 0;
  for (const bp of billingProfiles || []) {
    const user = (profiles || []).find(p => p.id === bp.user_id);
    if (!user) {
      console.log(`  ❌ ORPHAN: billing profile ${bp.id?.substring(0,8)} for non-existent user ${bp.user_id?.substring(0,8)}`);
      jIssues++;
    }
  }
  if (jIssues === 0) console.log("  ✅ All billing profiles valid");
  issues += jIssues;

  // CHECK K: Withdrawal requests with invalid status transitions
  console.log("\n[K] Withdrawal status consistency");
  let kIssues = 0;
  const validTransitions = {
    pending: ['processing', 'rejected'],
    processing: ['completed', 'failed'],
    completed: [],
    failed: [],
    rejected: [],
  };
  // We can't check history without audit log, so just check for impossible statuses
  for (const w of withdrawals || []) {
    if (!['pending', 'processing', 'completed', 'failed', 'rejected'].includes(w.status)) {
      console.log(`  ❌ INVALID STATUS: withdrawal ${w.id?.substring(0,8)} has status '${w.status}'`);
      kIssues++;
    }
  }
  if (kIssues === 0) console.log("  ✅ All withdrawal statuses valid");
  issues += kIssues;

  // CHECK L: Users with active subscription but no commissions earned by their referrer
  console.log("\n[L] Active subscriptions but referrer not earning");
  let lIssues = 0;
  for (const s of subscriptions || []) {
    if (s.status === 'active') {
      const userReferral = (referrals || []).find(r => r.referred_user_id === s.user_id);
      if (userReferral) {
        const referrerCommissions = (commissions || []).filter(c => c.user_id === userReferral.referrer_user_id && c.referral_id === userReferral.id);
        if (referrerCommissions.length === 0) {
          console.log(`  ❌ MISSING COMMISSION: user ${s.user_id?.substring(0,8)} has active subscription but referrer ${userReferral.referrer_user_id?.substring(0,8)} has NO commissions for this referral`);
          lIssues++;
        }
      }
    }
  }
  if (lIssues === 0) console.log("  ✅ All active subscriptions generate referrer commissions");
  issues += lIssues;

  console.log("\n========================================");
  console.log(`  AUDIT COMPLETE: ${issues} critical issues found`);
  console.log("========================================");
}

fullAudit().catch(console.error);
