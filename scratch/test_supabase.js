const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase URL:', url);
const supabase = createClient(url, key);

async function run() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(5);
    if (error) {
      console.error('Supabase error:', error.message || error);
    } else {
      console.log('Supabase users count:', data.length);
    }
  } catch (err) {
    console.error('Catch error:', err.message);
  }
}

run();
