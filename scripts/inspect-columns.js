const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectColumns() {
  // Check withdrawal_requests columns
  const { data: wrCols, error: wrErr } = await supabase
    .rpc('get_columns', { table_name: 'withdrawal_requests' });
  
  if (wrErr) {
    console.log("Cannot use rpc, trying alternative...");
    // Alternative: query information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'withdrawal_requests')
      .eq('table_schema', 'public');
    console.log("withdrawal_requests columns:", data?.map(c => c.column_name) || error?.message);
  } else {
    console.log("withdrawal_requests columns:", wrCols);
  }

  // Try to get all withdrawal_requests with their full data
  const { data: allWr } = await supabase.from('withdrawal_requests').select('*');
  console.log("\nAll withdrawal_requests:", JSON.stringify(allWr, null, 2));

  // Check referral_commissions columns
  const { data: rcData } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_name', 'referral_commissions')
    .eq('table_schema', 'public');
  console.log("\nreferral_commissions columns:", rcData?.map(c => c.column_name));

  // Check user_rewards columns  
  const { data: urData } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_name', 'user_rewards')
    .eq('table_schema', 'public');
  console.log("\nuser_rewards columns:", urData?.map(c => c.column_name));
}

inspectColumns().catch(console.error);
