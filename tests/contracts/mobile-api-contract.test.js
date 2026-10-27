const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const mobileAuth = fs.readFileSync(path.join(root, 'services/authApi.ts'), 'utf8');
const serverApp = fs.readFileSync(path.join(root, 'server/app.js'), 'utf8');

const authRoutes = [
  ['POST', '/auth/signup/request-otp'],
  ['POST', '/auth/signup'],
  ['POST', '/auth/login'],
  ['POST', '/auth/forgot-password'],
  ['POST', '/auth/reset-password'],
  ['POST', '/auth/logout'],
  ['GET', '/auth/profile'],
  ['PATCH', '/auth/profile'],
];

test('mobile auth client and backend expose matching authentication routes', () => {
  for (const [method, route] of authRoutes) {
    const routeDeclaration = `app.${method.toLowerCase()}('${route}'`;
    const alternateQuoteDeclaration = `app.${method.toLowerCase()}(\"${route}\"`;
    assert.ok(
      serverApp.includes(routeDeclaration) || serverApp.includes(alternateQuoteDeclaration),
      `Backend route missing: ${method} ${route}`,
    );
    assert.ok(
      mobileAuth.includes(`'${route}'`) || mobileAuth.includes(`\"${route}\"`),
      `Mobile client route missing: ${method} ${route}`,
    );
  }
});

test('mobile API client sends logout as an authenticated POST', () => {
  assert.match(mobileAuth, /export function logout\(token: string\)/);
  assert.match(mobileAuth, /request<\{ message: string \}>\('\/auth\/logout',\s*\{\s*method: 'POST',\s*token,/);
});
