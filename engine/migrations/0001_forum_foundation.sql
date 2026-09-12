begin;

create extension if not exists pgcrypto;
create schema if not exists forum;

create type forum_visibility as enum ('private', 'project', 'node', 'network', 'public');
create type forum_curation_status as enum ('none', 'selected', 'reference');
create type forum_object_type as enum ('build', 'block', 'collection');
create type forum_relation_type as enum ('contains', 'references', 'derived_from', 'tests', 'observes', 'uses', 'related');

create table app_users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  username text not null unique,
  bio text not null default '',
  avatar_url text,
  account_type text not null check (account_type in ('adult', 'child')),
  profile_visibility forum_visibility not null default 'private',
  created_at timestamptz not null default now()
);

create table guardian_links (
  guardian_id uuid not null references app_users(id) on delete cascade,
  child_id uuid not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (guardian_id, child_id),
  check (guardian_id <> child_id)
);

create table nodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  location_label text not null default '',
  visibility forum_visibility not null default 'network',
  created_at timestamptz not null default now(),
  check (visibility not in ('private', 'project'))
);

alter table app_users add column primary_node_id uuid references nodes(id);

create table forum_members (
  user_id uuid primary key references app_users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'curator', 'admin')),
  created_at timestamptz not null default now()
);

create table node_members (
  node_id uuid not null references nodes(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'curator', 'admin')),
  created_at timestamptz not null default now(),
  primary key (node_id, user_id)
);

create table builds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  creator_id uuid not null references app_users(id),
  node_id uuid references nodes(id),
  visibility forum_visibility not null default 'private',
  state text check (state in ('exploring', 'building', 'testing', 'working', 'dormant')),
  curation_status forum_curation_status not null default 'none',
  forked_from_build_id uuid references builds(id),
  forked_from_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table build_collaborators (
  build_id uuid not null references builds(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'contributor', 'owner')),
  created_at timestamptz not null default now(),
  primary key (build_id, user_id)
);

create table blocks (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text,
  description text,
  creator_id uuid not null references app_users(id),
  node_id uuid references nodes(id),
  payload_json jsonb not null default '{}'::jsonb,
  visibility forum_visibility not null default 'private',
  curation_status forum_curation_status not null default 'none',
  forked_from_block_id uuid references blocks(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  creator_id uuid not null references app_users(id),
  node_id uuid references nodes(id),
  visibility forum_visibility not null default 'private',
  curation_status forum_curation_status not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table connections (
  id uuid primary key default gen_random_uuid(),
  source_type forum_object_type not null,
  source_id uuid not null,
  target_type forum_object_type not null,
  target_id uuid not null,
  relationship_type forum_relation_type not null default 'related',
  position integer,
  created_by uuid not null references app_users(id),
  created_at timestamptz not null default now(),
  check (not (source_type = target_type and source_id = target_id)),
  unique (source_type, source_id, target_type, target_id, relationship_type)
);

create table revisions (
  id uuid primary key default gen_random_uuid(),
  object_type forum_object_type not null,
  object_id uuid not null,
  revision_number integer not null check (revision_number > 0),
  snapshot_json jsonb not null,
  created_by uuid not null references app_users(id),
  message text,
  created_at timestamptz not null default now(),
  unique (object_type, object_id, revision_number)
);

alter table builds
  add constraint builds_forked_from_revision_fk
  foreign key (forked_from_revision_id) references revisions(id);

create table repositories (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null unique references builds(id) on delete cascade,
  provider text not null,
  repo_url text not null,
  provider_repo_id text,
  default_branch text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table executable_previews (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references builds(id) on delete cascade,
  label text not null,
  url text not null,
  provider text not null,
  created_at timestamptz not null default now()
);

create table concepts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text
);

create table concept_connections (
  concept_id uuid not null references concepts(id) on delete cascade,
  object_type forum_object_type not null,
  object_id uuid not null,
  confidence real not null check (confidence between 0 and 1),
  source text not null check (source in ('ai', 'human', 'forum')),
  created_at timestamptz not null default now(),
  primary key (concept_id, object_type, object_id)
);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id),
  concept_id uuid references concepts(id),
  build_id uuid not null references builds(id),
  block_id uuid references blocks(id),
  statement text not null,
  source text not null check (source in ('ai', 'human', 'forum')),
  confidence real check (confidence between 0 and 1),
  confirmed_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

create table ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id),
  build_id uuid references builds(id),
  block_id uuid references blocks(id),
  created_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references ai_threads(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant', 'tool')),
  content text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table curation_reviews (
  id uuid primary key default gen_random_uuid(),
  object_type forum_object_type not null,
  object_id uuid not null,
  status forum_curation_status not null,
  curator_id uuid not null references app_users(id),
  note text,
  created_at timestamptz not null default now()
);

create index connections_source_idx on connections (source_type, source_id, relationship_type, position);
create index connections_target_idx on connections (target_type, target_id);
create index builds_node_visibility_idx on builds (node_id, visibility);
create index blocks_node_visibility_idx on blocks (node_id, visibility);
create index collections_node_visibility_idx on collections (node_id, visibility);

create or replace function forum.current_actor_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function forum.is_guardian_of(candidate_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, forum
as $$
  select exists (
    select 1 from guardian_links
    where guardian_id = forum.current_actor_id() and child_id = candidate_child_id
  )
$$;

create or replace function forum.is_forum_member()
returns boolean
language sql
stable
security definer
set search_path = public, forum
as $$
  select exists (select 1 from forum_members where user_id = forum.current_actor_id())
$$;

create or replace function forum.is_node_member(candidate_node_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, forum
as $$
  select exists (
    select 1 from node_members
    where node_id = candidate_node_id and user_id = forum.current_actor_id()
  )
$$;

create or replace function forum.can_view_scope(
  candidate_owner_id uuid,
  candidate_node_id uuid,
  candidate_visibility forum_visibility
)
returns boolean
language sql
stable
security definer
set search_path = public, forum
as $$
  select
    candidate_visibility = 'public'
    or candidate_owner_id = forum.current_actor_id()
    or forum.is_guardian_of(candidate_owner_id)
    or (candidate_visibility = 'node' and forum.is_node_member(candidate_node_id))
    or (candidate_visibility = 'network' and forum.is_forum_member())
$$;

create or replace function forum.can_view_build(candidate_build_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, forum
as $$
  select exists (
    select 1
    from builds b
    where b.id = candidate_build_id
      and (
        forum.can_view_scope(b.creator_id, b.node_id, b.visibility)
        or (
          b.visibility = 'project'
          and exists (
            select 1 from build_collaborators bc
            where bc.build_id = b.id and bc.user_id = forum.current_actor_id()
          )
        )
      )
  )
$$;

create or replace function forum.can_view_reference(candidate_type forum_object_type, candidate_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, forum
as $$
begin
  case candidate_type
    when 'build' then
      return forum.can_view_build(candidate_id);
    when 'block' then
      return exists (
        select 1 from blocks b
        where b.id = candidate_id
          and (
            forum.can_view_scope(b.creator_id, b.node_id, b.visibility)
            or (
              b.visibility = 'project'
              and exists (
              select 1 from connections c
              where c.target_type = 'block'
                and c.target_id = b.id
                and c.source_type = 'build'
                and c.relationship_type = 'contains'
                and forum.can_view_build(c.source_id)
              )
            )
          )
      );
    when 'collection' then
      return exists (
        select 1 from collections c
        where c.id = candidate_id
          and forum.can_view_scope(c.creator_id, c.node_id, c.visibility)
      );
  end case;
end;
$$;

create or replace function forum.can_edit_reference(candidate_type forum_object_type, candidate_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, forum
as $$
begin
  case candidate_type
    when 'build' then
      return exists (
        select 1 from builds b
        where b.id = candidate_id
          and (
            b.creator_id = forum.current_actor_id()
            or forum.is_guardian_of(b.creator_id)
            or exists (
              select 1 from build_collaborators bc
              where bc.build_id = b.id
                and bc.user_id = forum.current_actor_id()
                and bc.role in ('contributor', 'owner')
            )
          )
      );
    when 'block' then
      return exists (
        select 1 from blocks b
        where b.id = candidate_id
          and (b.creator_id = forum.current_actor_id() or forum.is_guardian_of(b.creator_id))
      );
    when 'collection' then
      return exists (
        select 1 from collections c
        where c.id = candidate_id
          and (c.creator_id = forum.current_actor_id() or forum.is_guardian_of(c.creator_id))
      );
  end case;
end;
$$;

alter table app_users enable row level security;
alter table guardian_links enable row level security;
alter table nodes enable row level security;
alter table forum_members enable row level security;
alter table node_members enable row level security;
alter table builds enable row level security;
alter table build_collaborators enable row level security;
alter table blocks enable row level security;
alter table collections enable row level security;
alter table connections enable row level security;
alter table revisions enable row level security;
alter table repositories enable row level security;
alter table executable_previews enable row level security;
alter table concepts enable row level security;
alter table concept_connections enable row level security;
alter table evidence enable row level security;
alter table ai_threads enable row level security;
alter table ai_messages enable row level security;
alter table curation_reviews enable row level security;

create policy app_users_visible_select on app_users for select using (
  id = forum.current_actor_id()
  or forum.is_guardian_of(id)
  or profile_visibility = 'public'
  or (profile_visibility = 'network' and forum.is_forum_member())
  or (profile_visibility = 'node' and forum.is_node_member(primary_node_id))
);

create policy nodes_visible_select on nodes for select using (
  visibility = 'public' or forum.is_forum_member() or forum.is_node_member(id)
);

create policy builds_visible_select on builds for select using (forum.can_view_build(id));
create policy blocks_visible_select on blocks for select using (forum.can_view_reference('block', id));
create policy collections_visible_select on collections for select using (
  forum.can_view_scope(creator_id, node_id, visibility)
);
create policy connections_visible_select on connections for select using (
  forum.can_view_reference(source_type, source_id)
  and forum.can_view_reference(target_type, target_id)
);

create policy builds_owner_insert on builds for insert with check (creator_id = forum.current_actor_id());
create policy blocks_owner_insert on blocks for insert with check (creator_id = forum.current_actor_id());
create policy collections_owner_insert on collections for insert with check (creator_id = forum.current_actor_id());

create policy builds_owner_update on builds for update using (
  creator_id = forum.current_actor_id() or forum.is_guardian_of(creator_id)
);
create policy blocks_owner_update on blocks for update using (
  creator_id = forum.current_actor_id() or forum.is_guardian_of(creator_id)
);
create policy collections_owner_update on collections for update using (
  creator_id = forum.current_actor_id() or forum.is_guardian_of(creator_id)
);

create policy connections_creator_insert on connections for insert with check (
  created_by = forum.current_actor_id()
  and forum.can_edit_reference(source_type, source_id)
  and forum.can_view_reference(target_type, target_id)
);

-- Forum curators can elevate only work they can already see. Their role does not
-- grant access to a child's private objects.
create policy curation_reviews_curator_select on curation_reviews for select using (
  forum.can_view_reference(object_type, object_id)
  and exists (
    select 1 from forum_members fm
    where fm.user_id = forum.current_actor_id() and fm.role in ('curator', 'admin')
  )
);

commit;
