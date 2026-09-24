const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://rnvccnatwccqphyyhkim.supabase.co';
// Test with anon key
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudmNjbmF0d2NjcXBoeXloa2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzk5OTksImV4cCI6MjA1NTc1NTk5OX0.dummy'; // Let's check if key works

console.log('Testing Supabase REST with url:', url);

const req = https.get(`${url}/rest/v1/users?select=*`, {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudmNjbmF0d2NjcXBoeXloa2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzk5OTksImV4cCI6MjA1NTc1NTk5OX0.dummy',
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log('Body:', body));
});

req.on('error', console.error);
