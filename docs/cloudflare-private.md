# Private Cloudflare deployment

The static Wiki stays built by Astro. A Worker authenticates **all** asset requests with run_worker_first=true. No default credentials exist; missing or weak configuration returns 503 rather than serving the site.

## Initial setup
1. In Cloudflare Workers & Pages, create a Worker from GitHub and select PhilosophiaAtlas/philosophiaatlas.github.io (main branch). Worker name: philosophia. Root directory: repository root.
2. Build command: npm run build:cloudflare. Deploy command: npx wrangler deploy. Use Node 22 or later. Disable preview builds.
3. In Worker Settings > Variables and Secrets, add secret values AUTH_USER, AUTH_PASSWORD (at least 20 characters, random and unique), AUTH_SESSION_KEY (at least 32 characters, independent random value). Never commit or send them in chat. The initial deployment deliberately refuses access before configuration.
4. Verify in an incognito browser that the home, /wiki/consciousness/, /search-index.json, /preview/consciousness.json and /pagefind/pagefind.js all deny unauthenticated access. Sign in and verify the wiki, then log out using the menu.
5. After verification, remove the public GitHub Pages deployment and stop its publish workflow. Make repositories with private material private. Public history and previous copies cannot be retroactively made secret. For private component repos, create a fine-grained GitHub token with Contents: read for those repos, put it in Cloudflare Builds secrets as WIKI_CONTENT_TOKEN. Also configure the repository Actions secret if GitHub CI is retained. Do not expose private build artifacts on a public CI repository.

## Security and limitations
Signed host-only session cookies expire after 12 hours or 30 days with Remember me. Changing password or session key invalidates old sessions. Logout deletes the browser cookie; a copied cookie remains usable until expiry or credential rotation. Login requests are rate limited per IP and Cloudflare location; limits are approximate, so use a strong password. All responses are private/no-store. There is no signup, recovery endpoint or account database. The platform itself, account security, and actual deployment routing require verification. Use the free plan and do not enable paid services unless needed.
