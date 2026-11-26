# Alpha.9 Research workspace
- Research notes are stored only in IndexedDB, scoped to the browser origin. No sync, account database or third-party service is used. Logout does not erase them; do not use a shared browser profile for confidential notes.
- Create free-standing notes or article-linked notes. Select text within an article to capture an exact quotation, including its article ID, source revision and offset. On later builds, the quotation is relocated only if it has a unique exact match; ambiguous or missing quotes are flagged, not guessed.
- Persistent visual highlighting uses the CSS Custom Highlight API when supported; other browsers can still use the saved excerpt and jump function.
- Notes link to other notes, and backlinks are derived automatically. A deleted or not-yet-imported target is marked missing. Imports merge by ID and last-updated time, not by text similarity.
- JSON exports contain all notes and quotations in plaintext. Keep them private. Clear data in the research workspace or browser site settings. Local data may be lost when browser storage is cleared.
- Limits: 1,000 notes, 20,000 characters per note body, 4,000 per quotation, 20 tags and 100 outgoing links per note. No additional database service is required.
