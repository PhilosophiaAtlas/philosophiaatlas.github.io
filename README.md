# Philosophia

PhilosophiaAtlas integration and deployment repository. A Vietnamese philosophy wiki, static-first and mobile-first. The initial milestone is First Light, not the complete v0.1 feature set.

## Build

Node.js 22 and Git are required. Run `node scripts/sync.mjs`, `npm install`, then `npm test` and `npm run build`. The sync script checks out exactly the component commits in `philosophia.lock.json`. It refuses to overwrite a dirty checkout. `npm run preview` serves the built site locally.

GitHub Pages: select **GitHub Actions** as the source in Settings → Pages, then run the Deploy workflow. The website is intended for `https://philosophiaatlas.github.io/`.

## Scope

Initial articles are drafts. Search, full citation handling, semantic relations and personal workspaces are future work. No runtime server, paid API or analytics is used. Code and content licensing are pending the project owner's approval.
