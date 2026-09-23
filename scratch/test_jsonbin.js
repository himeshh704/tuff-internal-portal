const https = require('https');

function createBin(data) {
  return new Promise((resolve, reject) => {
    const jsonStr = JSON.stringify(data);
    const req = https.request('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': '$2a$10$tQ0W1kE6S4WzJz8a9dF6u.3z7A9D8E7F6G5H4I3J2K1L0M9N8O7P6', // random test header
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(jsonStr);
    req.end();
  });
}

createBin({ test: true }).then(console.log).catch(console.error);
