# Alpha.8: media and history
- Store approved local raster images in the private knowledge-base repository under `media/`. Use lowercase names such as `diagram-1.png` (PNG, JPEG, WebP, GIF, AVIF, up to 10 MiB). Markdown: `![Descriptive alternative text](/media/diagram-1.png "Caption")`.
- Local images open in the viewer; external images are not opened by it. Add only material you have permission to store. No new media content is included in this release.
- Revision history is pinned to the deployed knowledge-base commit. Fetch at most 200 commits, show up to 20 file revisions with source at most 100,000 bytes each. Renames are not followed. Deleted or edited text in historical snapshots is accessible to authenticated readers; do not commit secrets. This is not a backup or restore mechanism.
- The raw revision JSON and media use the same Worker authentication as all other assets.
