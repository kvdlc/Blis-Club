const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTree() {
  // 1. Check app slug
  const { data: apps } = await supabase.from('applications').select('id, slug, name');
  console.log("Apps:", apps);

  // 2. Check referrals with application_id
  const { data: refsWithApp } = await supabase.from('referrals').select('id, application_id, referrer_user_id, referred_user_id').not('application_id', 'is', null);
  console.log("\nReferrals WITH application_id:", refsWithApp?.length || 0);

  // 3. Check referrals without application_id
  const { data: refsWithoutApp } = await supabase.from('referrals').select('id, application_id, referrer_user_id, referred_user_id').is('application_id', null);
  console.log("Referrals WITHOUT application_id:", refsWithoutApp?.length || 0);
  console.log("Sample:", refsWithoutApp?.slice(0, 3));

  // 4. Try the old tree endpoint logic manually
  const { data: allReferrals } = await supabase.from('referrals').select('*');
  console.log("\nTotal referrals:", allReferrals?.length);

  // Build tree manually
  const referredIds = new Set((allReferrals || []).map(r => r.referred_user_id).filter(Boolean));
  const referrerIds = new Set((allReferrals || []).map(r => r.referrer_user_id).filter(Boolean));
  const rootIds = Array.from(referrerIds).filter(id => !referredIds.has(id));
  console.log("Root IDs (referrers who aren't referred):", rootIds);
}

debugTree().catch(console.error);
