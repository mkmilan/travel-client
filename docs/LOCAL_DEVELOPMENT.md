# Isolated web development

Use the review branch. Copy `.env.example` to `.env.local`; keep the API pointed at a local development server on port 5001. Do not copy production `.env` files or credentials into this checkout. `NEXT_PUBLIC_*` values are visible to browser users and must never contain secrets.

Install with `npm ci --ignore-scripts`. Run `npm test` for offline regression checks. Run `npm run dev -- --hostname 127.0.0.1` only with the local backend configured in development mode and a separate empty development database. Do not use production account/location data. Maps and reverse-geocoding use external services; use synthetic locations and stub those requests for automated tests.

`npm run build` checks production compilation; it may need access to Google's font CDN because the existing layout uses next/font/google. No deployment is implied. The existing `npm run lint` command has no ESLint setup and is not currently a validation gate.

Next.js is pinned to 15.5.28, the patched 15.x release in https://nextjs.org/blog/nextjs-security-update-october-14-2026. This is stabilization within 15.x, not a migration to 16.

Tracking sessions now use account-specific IndexedDB keys. Old unowned `activeSession` data is retained but never automatically attached to an account; recovery/migration needs a deliberate user decision. On account change the authenticated subtree remounts, clearing in-memory GPS state and stopping watchers. Existing saved drafts are preserved for their original account. This is isolation within the app, not encryption against someone with local browser access.

Before release, verify on a browser: login/feed; logout success, network failure and CSRF failure; start/pause/resume/save trip; account A → logout → B with no A track shown; return to A restores only A's draft. These device/browser integration checks are additional to the offline tests.

## Validation for this change

On Node 24.19.0: ten offline tests passed and the production build completed using localhost-only API/site settings and disabled Next telemetry. The lock resolves Next 15.5.28 and Sharp 0.35.5. This does not prove end-to-end login, browser GPS, or backend connectivity; run the manual scenarios above against the isolated backend before release.

API photo components bypass Next's shared image optimizer and use credentialed browser image requests. The server must return exact-origin credentialed CORS and `Cache-Control: private, no-store`. This avoids a shared optimizer fetching private images without a user session. Browser cookie restrictions still apply; production cross-site cookies must be configured appropriately. Test owner/follower/public photo viewing and logout denial on the actual browser before release. Existing optimizer caches from older deployments may require invalidation when deploying the privacy change. No web GPX-download request exists in the current source; maps consume the authenticated trip response's simplified route.

## Follow-up hardening

Browser authentication no longer caches full API login responses in localStorage. The native-client bearer token returned by the API is discarded before profile state is stored in memory; legacy `userData` cache entries are removed. Browser authentication relies on the HttpOnly cookie and `/auth/me`. Token-bearing debug logs were removed from login paths.

The lockfile pins patched same-major PostCSS 8.5.31, nanoid 3.3.20 and source-map-js 1.2.2 via npm overrides because Next 15.5.28 otherwise pins an older PostCSS dependency. Keep these overrides until upstream permits equivalent patched versions. Recheck the audit and build whenever changing them.

Actual cloud-browser validation was attempted but could not connect to the loopback services isolated inside command sandboxes. An out-of-sandbox launch failed before execution due to a read-only runtime path. No restriction was bypassed. The manual browser/GPS scenarios above remain an explicit release gate; compilation and fixture tests do not substitute for them.

Follow-up verification: 12 offline regression tests and a fresh production build (18 static pages) passed after these changes. `npm audit --omit=dev` reports zero findings at this check. Full audit still reports two moderate build-tool findings through `@tailwindcss/typography` → `postcss-selector-parser` (GHSA-rj75-hqrm-r3gf). The suggested automatic fix is a typography downgrade; it was not applied blindly. Review the parser/tooling upgrade separately, especially before accepting untrusted CSS input.
