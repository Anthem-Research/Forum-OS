# Forum Engine

Forum Engine is the web application at the centre of Forum: a quiet environment
for building, observing, testing, connecting, modifying, forking and contributing
real work.

This directory implements the foundation milestone from **Forum Engine — Product
+ Technical Specification v0.1**. The Android launcher in the repository root is
a protected doorway into selected tools; it is not the Engine itself.

## Present milestone

- strict TypeScript and Next.js App Router application;
- a static institutional shell that publishes only explicitly public records;
- the typed `Block / Build / Collection / Connection` object grammar;
- realistic Thetis, Deep Sea and Garden Rover seed data;
- reusable Blocks that can appear in multiple contexts;
- private, project, Node, Network and public visibility rules;
- guardian-aware access without an administrator privacy bypass;
- PostgreSQL foundation migration with row-level security;
- sparse Network, Build, Block, Collection, Person, Node, Library and Search
  surfaces;
- a browser-local private workspace where a device can create spaces and
  mixed working objects, reuse one object across spaces, save and restore
  versions, and export or restore a validated backup;
- domain, graph, privacy and repository tests;
- local/air-gapped and connected deployment profiles documented before cloud
  services are added.

Server-backed creation, production authentication, database persistence, file
upload, publication, forking and contextual AI are not represented as working
controls yet. The private workspace is deliberately stored in the current browser
and is neither encrypted nor a strict air gap. Those capabilities are
the next implementation phases; the interface omits them instead of pretending
they work.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/workspace`. The workspace is device-local: each
browser profile keeps its own copy, and a JSON backup is the current transfer
mechanism between devices. The public Network and Library expose only records
whose visibility is explicitly public.

## GitHub Pages

The production build is a static export. GitHub Actions verifies the Engine,
checks the exported artifact for private seed markers, and publishes `engine/out`
to GitHub Pages after the Engine CI workflow succeeds on `main`.

## Verify

```powershell
npm run check
```

This runs lint, strict type-checking, unit tests and a production build.

## Database

The development interface currently uses the typed seed repository. The first
PostgreSQL schema and RLS policies are in
[`migrations/0001_forum_foundation.sql`](migrations/0001_forum_foundation.sql).
Apply it only to an empty development database. Application persistence will be
wired to this schema in the next phase.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the domain boundaries,
privacy invariants and connected/offline deployment model.
