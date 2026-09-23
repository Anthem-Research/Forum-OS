# Forum: private work and editorial publication

Forum Engine and Workbench are working environments. Forum is also an
editorial institution. These responsibilities have separate permissions.

1. A child's work begins local/private. Making, saving, connecting or
   branching a Build does not submit or publish it.
2. A guardian may choose specific material to propose for collaboration.
   Exporting a private backup is never a proposal or publication.
3. Collaboration grants access only to the specifically approved material.
   Related Builds, revisions and private connections stay private unless
   selected separately. Reusing or branching a shared Build does not confer
   publication rights.
4. A Forum editor separately decides which proposed material belongs in
   the curated Library. Members cannot self-publish into it. No amount of
   member activity, popularity or inheritance from a published Build
   promotes work automatically.
5. A public Forum Journal is authored and edited by Forum. It may contain
   institutional field notes, methods, questions, references, interviews
   and tools without including any child's work. Publishing identifiable
   child work requires a distinct guardian decision and a child-appropriate
   assent process. Neither is a membership requirement.
6. Private workspace data must never enter public static assets, Git history,
   logs, analytics, AI prompts or backups outside the household by default.

This document describes the target boundary. The first Workbench slice has
local persistence and private backup only. Guardian approval, isolated
accounts, selective transfer, Network membership, submission review and
publication are *not* implemented. The public journal is not generated from
member workspaces. Architecture work must retain the Engine's existing RLS
and permission rules and add allow/deny tests when connecting persistence.
