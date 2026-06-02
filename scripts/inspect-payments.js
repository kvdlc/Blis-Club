const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectPayments() {
  const { data, error } = await supabase.from('subscription_payments').select('*').limit(10);
  if (error) {
    console.error("subscription_payments error:", error.message);
  } else {
    console.log("subscription_payments rows:", data?.length || 0);
    for (const row of data || []) {
      console.log(row);
    }
  }

  // Check if referral_commissions has subscription_payment_id or similar
  const { data: rc } = await supabase.from('referral_commissions').select('*').limit(1);
  if (rc && rc[0]) {
    console.log("\nreferral_commissions columns:", Object.keys(rc[0]));
  }
}

inspectPayments().catch(console.error);
