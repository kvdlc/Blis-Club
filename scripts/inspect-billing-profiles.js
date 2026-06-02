const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectBillingProfiles() {
  // Try to get a sample row to see columns
  const { data, error } = await supabase.from('billing_profiles').select('*').limit(1);
  if (error) {
    console.error("billing_profiles error:", error.message);
  } else {
    console.log("billing_profiles columns:", data && data[0] ? Object.keys(data[0]) : "Table exists but no columns info (empty)");
  }

  // Try to insert a test billing profile to verify structure
  console.log("\nTrying to insert test billing profile...");
  const testProfile = {
    user_id: '1830d1ed-ef20-4f27-82ad-2a49744124f9',
    country_code: 'PE',
    document_type: 'dni',
    document_number: '12345678',
    full_name: 'Test User',
    withdrawal_method: 'binance_pay',
    binance_pay_id: '123456',
    binance_email: 'test@example.com'
  };

  const { data: insertData, error: insertErr } = await supabase
    .from('billing_profiles')
    .insert(testProfile)
    .select();

  if (insertErr) {
    console.error("Insert error:", insertErr.message, insertErr.details, insertErr.hint);
  } else {
    console.log("Inserted successfully:", insertData);
    // Clean up
    await supabase.from('billing_profiles').delete().eq('id', insertData[0].id);
    console.log("Cleaned up test row.");
  }
}

inspectBillingProfiles().catch(console.error);
