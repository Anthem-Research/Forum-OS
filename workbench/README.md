# Forum Workbench — first local slice

This is a separate static client in the existing Forum OS repository. Serve
`workbench/` from a dedicated localhost origin or a deliberately isolated
HTTPS origin. Open `index.html`; once its service worker has installed, its
application shell can reopen without a network connection. All build records
live in that browser profile's IndexedDB. No accounts, telemetry, remote
fonts, upload endpoint, or automatic sync are used.

This slice supports creating and editing Builds, drawing, connecting Builds,
saving and restoring versions, branching a Build, deleting a Build, and
downloading and restoring a manual JSON backup into an empty workspace. Drawings are saved as PNG data URLs inside
IndexedDB. The backup contains *all* work in this local browser, including
drawings and notes. The export is a private archive, not a submission to Forum.

The layout takes the editorial restraint, white surface, neutral typography
and sparse indexing of PARC-Labs/Applied-State-Site. It does not reuse its
member database, visual assets or editorial content.

## Privacy boundary

The source repository contains only application code. Never commit a real
child's work or exported backup. Browser profiles sharing the same origin can
read the same local workspace; keep the workbench on a dedicated origin and
profile. IndexedDB is ordinary local browser storage, not encryption. Back up
the data before clearing the profile. A strict air gap requires a local host
with physically disabled network egress; an offline-capable browser session
alone is not an air gap.

No member Network, public Journal, guardian authentication, publication,
import, file attachments or secure multi-user isolation are implemented here.
The Android launcher can later open a parent-approved Workbench destination,
but this page does not provide device containment.

The editorial contract for a future sharing flow is in
[docs/FORUM_EDITORIAL_BOUNDARY.md](../docs/FORUM_EDITORIAL_BOUNDARY.md).
Do not add an automatic publish or background sync action to this client.
