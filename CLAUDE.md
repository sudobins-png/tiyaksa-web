# tiyaksa-web

Next.js site for tiyaksa.ru; the /blog is a headless WordPress on the same VPS.

- Server, deploy, blog/WordPress, n8n and security rules: read `docs/SERVER.md`
  before touching anything on the VPS or the deploy workflow.
- Pushing to `main` deploys to production (GitHub Actions). The deploy steps
  that actually run live in `/root/deploy/deploy-gate.sh` on the server, not in
  `.github/workflows/deploy.yml`.
