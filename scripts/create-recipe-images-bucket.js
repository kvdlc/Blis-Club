const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yauoswqvuwruufozwduu.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdW9zd3F2dXdydXVmb3p3ZHV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA5OTU3OSwiZXhwIjoyMDk1Njc1NTc5fQ.bj-H3p0VpX5yrNZoCVU_l7uuBD-DAGGm0vWvVyN_ngo';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createBucket() {
  console.log('Creating recipe-images bucket...');

  const { data, error } = await supabase.storage.createBucket('recipe-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });

  if (error) {
    if (error.message?.includes('already exists') || error.message?.includes('Duplicate')) {
      console.log('Bucket already exists.');
    } else {
      console.error('Error creating bucket:', error);
      process.exit(1);
    }
  } else {
    console.log('Bucket created successfully:', data);
  }
}

createBucket();
