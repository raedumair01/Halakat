const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../../server/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
});

test('root endpoint identifies the Halakat API', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, service: 'Halakat API' });
});

test('protected profile endpoint rejects requests without a bearer token', async () => {
  const response = await fetch(`${baseUrl}/auth/profile`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: 'Missing authorization token.' });
});
