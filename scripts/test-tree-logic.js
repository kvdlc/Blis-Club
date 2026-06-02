const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTreeEndpointLogic() {
  console.log("=== TESTING TREE ENDPOINT LOGIC ===\n");

  // Simulate the endpoint logic
  const appSlug = "guau";
  
  // 1. Get app id
  const { data: app } = await supabase.from("applications").select("id").eq("slug", appSlug).single();
  const appId = app?.id;
  console.log("App ID for 'guau':", appId);

  // 2. Check if referrals have application_id
  const { count: withAppCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .not("application_id", "is", null);
  console.log("Referrals WITH application_id:", withAppCount);

  // 3. Get referrals (filtered or all)
  let query = supabase.from("referrals").select("*");
  if (appId && (withAppCount || 0) > 0) {
    query = query.eq("application_id", appId);
  }
  const { data: referrals } = await query;
  console.log("Referrals returned:", referrals?.length);

  // 4. Get profiles
  const userIds = new Set();
  (referrals || []).forEach((r) => {
    if (r.referrer_user_id) userIds.add(r.referrer_user_id);
    if (r.referred_user_id) userIds.add(r.referred_user_id);
  });
  console.log("Unique user IDs:", userIds.size);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, display_name, avatar_url")
    .in("id", Array.from(userIds));
  console.log("Profiles found:", profiles?.length);

  // 5. Find roots
  const referredIds = new Set((referrals || []).map((r) => r.referred_user_id).filter(Boolean));
  const referrerIds = new Set((referrals || []).map((r) => r.referrer_user_id).filter(Boolean));
  const rootIds = Array.from(referrerIds).filter((id) => !referredIds.has(id));
  console.log("Root IDs:", rootIds);

  // 6. Build tree for first root
  if (rootIds.length > 0) {
    const rootId = rootIds[0];
    const rootProfile = profiles?.find((p) => p.id === rootId);
    console.log("\n=== ROOT NODE ===");
    console.log("Name:", rootProfile?.display_name || rootProfile?.email);
    console.log("ID:", rootId);

    // Direct children
    const children = (referrals || []).filter((r) => r.referrer_user_id === rootId && r.referred_user_id);
    console.log("Direct referrals:", children.length);
    for (const child of children) {
      const childProfile = profiles?.find((p) => p.id === child.referred_user_id);
      console.log(`  - ${childProfile?.display_name || childProfile?.email} (${child.referred_user_id?.substring(0, 8)})`);
    }

    // Count all descendants
    const countDescendants = (userId, depth = 0) => {
      const direct = (referrals || []).filter((r) => r.referrer_user_id === userId && r.referred_user_id);
      let count = direct.length;
      for (const d of direct) {
        count += countDescendants(d.referred_user_id, depth + 1);
      }
      return count;
    };
    console.log("Total network size:", 1 + countDescendants(rootId));
  }

  console.log("\n=== TEST COMPLETE ===");
}

testTreeEndpointLogic().catch(console.error);
