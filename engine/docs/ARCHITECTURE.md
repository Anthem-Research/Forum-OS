# Forum Engine foundation architecture

Status: implementation foundation 0.1
Date: 9 September 2026

## Product boundary

Forum is the institution. Forum Engine is its digital operating environment.
Forum Nodes are physical, situated manifestations. Forum Network connects
members and published work. Forum Library is an editorial selection rather than
a mirror of everything stored in the system.

The Android launcher remains a separate client and containment boundary. It may
open Forum Engine or other adult-approved tools, but launcher navigation must not
become the Engine's information architecture.

## Domain grammar

```text
Person ──creates──▶ Block
  │                  │
  │                  ├──appears in──▶ Build
  │                  └──appears in──▶ Collection
  │
Node ──situates──▶ Build ──forks from──▶ Build
                         └──records──▶ Revision
```

`Connection` is a first-class record. It contains two typed references, a quiet
semantic relationship and optional position. A Block is never duplicated merely
because it appears in several Builds or Collections.

The TypeScript domain is independent of rendering and storage. UI components do
not query database tables directly. The current seed repository and future
PostgreSQL repository must satisfy the same application-facing contract.

## Privacy invariants

Creation and publication are separate operations.

1. New child work begins `private`.
2. A guardian may view and help edit their child's private work.
3. `project` admits explicit collaborators only.
4. `node` admits members of the object's Node.
5. `network` admits authenticated Forum members.
6. `public` is exceptional and is not required by the first release.
7. Curator or administrator status never silently opens private child work.
8. Curation status is editorial metadata, not a visibility grant.

These rules live in a pure domain service and in PostgreSQL row-level security.
Hiding a control in React is never treated as an access boundary.

## Deployment profiles

### Node-local / air-gapped

- `FORUM_DEPLOYMENT_MODE=local`
- self-host the standalone Next.js server on hardware controlled by the Node;
- use local PostgreSQL with the same migrations as the connected service;
- keep object storage on encrypted Node-controlled disks;
- leave all AI configuration empty, or point `AI_BASE_URL` at a local provider;
- do not configure telemetry, third-party fonts, remote images or external CDNs;
- reach the Engine over a private LAN whose egress can be physically disabled.

The web application is therefore usable without Vercel, Supabase or an internet
connection. A service worker and offline browser cache are not yet implemented;
air-gapped operation in this milestone means a local server and local network,
not a browser that continues independently after that server disappears.

### Connected Forum Network

- `FORUM_DEPLOYMENT_MODE=connected`
- deploy the same application and PostgreSQL schema on managed infrastructure;
- enable only explicit Network integrations;
- route file and AI access through permission-filtered server services;
- never send private object context to an external model by default.

### Movement between the two

Automatic bidirectional sync is intentionally deferred. The next design step is
an append-only, signed transfer bundle containing object snapshots, revisions,
connections, provenance and blobs. Import must be previewed and approved by an
adult or Node steward. This is safer and more legible for air-gapped households
than introducing an invisible background sync engine prematurely.

## Application boundaries

- `src/core/domain.ts` — stable typed vocabulary.
- `src/core/permissions.ts` — central visibility and edit decisions.
- `src/core/graph.ts` — connection validation and composition.
- `src/core/repository.ts` — read boundary used by Server Components.
- `src/auth` — request-scoped identity boundary. The current development preview
  provider is explicit and unavailable in production or connected mode.
- `src/components` — Forum presentation grammar.
- `src/app` — App Router pages and metadata.
- `migrations` — PostgreSQL schema and row-level security.

Reads happen directly in Server Components. Future interface mutations use
Server Actions. Route Handlers are reserved for external clients, transfer
bundles, repository webhooks and other explicit integration boundaries.

## Next implementation sequence

1. Complete local household auth and connected adult magic-link auth behind the
   request-scoped session interface. Production currently fails closed rather
   than trusting a development identity.
2. Implement the PostgreSQL repository and transaction-scoped actor identity.
3. Add real creation for text, URL and upload Blocks.
4. Add reuse, ordering and connection mutations.
5. Add publication and editorial submission as distinct workflows.
6. Add revisions and Forum-level forking.
7. Add repository and executable Blocks.
8. Add contextual `Ask` only after permission-filtered retrieval is tested.

Community extensions, billing and Network synchronization remain separate
architectural workstreams. None should be allowed to weaken the object grammar,
the visual frame or the privacy invariants above.
