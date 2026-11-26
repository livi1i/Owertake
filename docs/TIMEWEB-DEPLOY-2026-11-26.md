# Timeweb deployment — 2026-11-26

Published combined design + OS5 branch to https://helmerzy.tw1.ru/.

- Active release: `6ade4c5a7817e579` (99 application files).
- Existing production configuration and SQLite database preserved.
- Server-side SQLite snapshot and previous router/current pointer saved in private `backup-20261126-113413`.
- Fifteen earlier releases moved to private `archived-releases-20261126`; only the new release remains in `releases`.
- Router now serves PNG and WebP with correct MIME types and the existing strict filename allowlist.
- Verified HTTP 200 for home, `/cabinet`, and `/api/health`; health reports the new release. All 35 PNG/WebP assets match local release bytes exactly.
- Browser check confirmed redesigned homepage and OS5 sign-in screen. Authenticated CRM actions were not exercised.

The existing HTTP deployment endpoint has an 8 MB request limit, so this release was uploaded through the authenticated Timeweb panel and activated using PHP CLI. Application-only manifest and activation helpers remain private and untracked. No credentials or production database are committed to Git.
