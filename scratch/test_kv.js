const https = require('https');

function postKv(key, data) {
  return new Promise((resolve, reject) => {
    const jsonStr = JSON.stringify(data);
    const req = https.request(`https://kvdb.io/m7R7N3Yv9L1K4P8X/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonStr)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(jsonStr);
    req.end();
  });
}

function getKv(key) {
  return new Promise((resolve, reject) => {
    https.get(`https://kvdb.io/m7R7N3Yv9L1K4P8X/${key}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing KV storage write...');
  await postKv('test_key', { hello: 'world', timestamp: Date.now() });
  console.log('Testing KV storage read...');
  const res = await getKv('test_key');
  console.log('Result:', res);
}

run();
