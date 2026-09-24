const https = require('https');

const refId = 'rnvccnatwccqphyyhkim';
const url = `https://${refId}.supabase.co/rest/v1/users?select=*`;

console.log('Testing connection to Supabase Project:', url);

https.get(url, (res) => {
  console.log('Response Status:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response Body:', body));
}).on('error', (err) => {
  console.error('Connection error:', err.message);
});
