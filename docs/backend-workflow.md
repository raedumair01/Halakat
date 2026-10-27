# Halakat backend workflow

This workflow covers the Express/MongoDB API in `server/`, the Vercel entry point in `api/index.js`, and the React Native API client in `services/`.

## Branch and pull-request policy

1. Start from the latest `main` and create a focused branch, for example `fix/auth-session-revocation` or `feat/practice-progress-api`.
2. Keep changes scoped. If a change modifies an API, update its backend route and mobile client contract together.
3. Open a pull request to `main`. Describe behavior changes, environment-variable changes, migration/index requirements, and manual verification performed.
4. Wait for the **Backend + mobile API contracts** workflow to pass. Review the diff and CI output before merging.
5. Do not merge or deploy production changes without explicit approval from the repository owner.

## Local checks

Install dependencies with the committed lockfile:

```bash
npm ci
npm run test:backend
npm run lint
npm run typecheck
```

Start the API locally with `npm run server`. Configure local-only values in an untracked `.env` file; never commit secrets.

## Test coverage

- `tests/backend/api-smoke.test.js` starts the Express app without opening a database connection and checks the root response plus unauthenticated access to a protected profile endpoint.
- `tests/contracts/mobile-api-contract.test.js` checks that the mobile auth service and Express app agree on the supported authentication route/method pairs.
- CI runs those tests, lint, and TypeScript checks on pull requests targeting `main` and pushes to `main`.

The smoke tests intentionally do not claim to validate MongoDB-backed login, session creation/revocation, OTP delivery, or rate-limit behavior. Those need integration tests against an isolated test database and mocked email delivery before those behaviors can be considered fully verified.

## API contract rules

- Keep route paths, HTTP methods, request fields, response shapes, and status-code behavior synchronized between `server/app.js` and `services/authApi.ts`.
- Validate and normalize client input on the server; never trust client-side validation as an authorization boundary.
- Protected routes must authenticate the caller and authorize access to the requested resource.
- Do not log passwords, OTPs, reset tokens, bearer tokens, or secret environment values.
- Return stable, user-safe error messages; keep implementation details in server-side logs only.
- Any authentication/session change must include regression coverage for successful login, logout/revocation, expired/revoked sessions, and password-reset invalidation.

## Vercel preview and production deployment

Vercel remains responsible for deployments through its Git integration; this GitHub Actions workflow **does not deploy** anything.

1. Connect the repository to the intended Vercel project and verify that pull requests create Preview Deployments.
2. Configure Vercel's production branch as `main`; merge only after review and required checks pass.
3. In GitHub repository settings, configure the workflow check **Backend + mobile API contracts** as a required status check for `main` and require pull requests before merging. Branch protection is a repository setting and is not changed by this workflow file.
4. Add environment variables separately to Vercel Preview and Production environments. Use separate database credentials/data where practical. Never place secrets in GitHub workflow YAML or `EXPO_PUBLIC_*` variables.
5. Before a production release, verify the preview deployment's API health and run an authenticated end-to-end smoke test using a dedicated test account. Confirm login, profile fetch, logout, and rejection of the revoked token.
6. Promote by merging the approved PR to `main` and let Vercel deploy the production branch. Verify the production deployment and logs afterward.

If Vercel's project is configured to deploy pull requests automatically, Preview Deployments may be created before GitHub Actions finishes. Configure Vercel's deployment checks/branch protection if previews must wait for CI. This workflow itself has no deployment credentials and cannot trigger a production deployment.

## Secrets and environment configuration

- Set `MONGODB_URI`, a strong random `JWT_SECRET`, and email provider credentials in Vercel's environment settings as needed.
- Keep production JWT secrets distinct from Preview/local secrets.
- Never use the development JWT fallback in production.
- Rotate any secret that was accidentally committed or exposed; changing the example file alone does not rotate deployed credentials.
