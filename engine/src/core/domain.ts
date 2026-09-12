export type AccountType = "adult" | "child";
export type Visibility = "private" | "project" | "node" | "network" | "public";
export type CurationStatus = "none" | "selected" | "reference";
export type BuildState = "exploring" | "building" | "testing" | "working" | "dormant";
export type ObjectKind = "build" | "block" | "collection";
export type RelationType =
  | "contains"
  | "references"
  | "derived_from"
  | "tests"
  | "observes"
  | "uses"
  | "related";

export interface ForumUser {
  id: string;
  username: string;
  displayName: string;
  accountType: AccountType;
  guardianUserId?: string;
  bio: string;
  nodeId?: string;
  createdAt: string;
}

export interface ForumNode {
  id: string;
  slug: string;
  name: string;
  description: string;
  locationLabel: string;
  visibility: Exclude<Visibility, "project">;
  createdAt: string;
}

export interface Build {
  kind: "build";
  id: string;
  slug: string;
  title: string;
  description: string;
  creatorId: string;
  contributorIds: string[];
  nodeId?: string;
  visibility: Visibility;
  state?: BuildState;
  curationStatus: CurationStatus;
  forkedFromBuildId?: string;
  forkedFromRevisionId?: string;
  updatedAt: string;
  createdAt: string;
}

export type BlockType =
  | "text"
  | "question"
  | "image"
  | "drawing"
  | "code"
  | "repository"
  | "executable"
  | "measurement"
  | "observation"
  | "experiment"
  | "component";

export interface BlockPayload {
  body?: string;
  language?: string;
  value?: string;
  unit?: string;
  sourceUrl?: string;
  label?: string;
  visual?: "boat" | "sea" | "rover";
}

export interface Block {
  kind: "block";
  id: string;
  type: BlockType;
  title?: string;
  description?: string;
  creatorId: string;
  nodeId?: string;
  visibility: Visibility;
  curationStatus: CurationStatus;
  payload: BlockPayload;
  forkedFromBlockId?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Collection {
  kind: "collection";
  id: string;
  slug: string;
  title: string;
  description: string;
  creatorId: string;
  nodeId?: string;
  visibility: Visibility;
  curationStatus: CurationStatus;
  updatedAt: string;
  createdAt: string;
}

export type ForumObject = Build | Block | Collection;

export interface ObjectReference {
  type: ObjectKind;
  id: string;
}

export interface Connection {
  id: string;
  source: ObjectReference;
  target: ObjectReference;
  relationship: RelationType;
  position?: number;
  createdBy: string;
  createdAt: string;
}

export interface Revision {
  id: string;
  object: ObjectReference;
  revisionNumber: number;
  snapshot: Readonly<Record<string, unknown>>;
  createdBy: string;
  message?: string;
  createdAt: string;
}

export interface GuardianLink {
  guardianId: string;
  childId: string;
}

export type NodeRole = "member" | "curator" | "admin";

export interface NodeMembership {
  nodeId: string;
  userId: string;
  role: NodeRole;
}

export type CollaboratorRole = "viewer" | "contributor" | "owner";

export interface BuildCollaborator {
  buildId: string;
  userId: string;
  role: CollaboratorRole;
}

export type ForumRole = "member" | "curator" | "admin";

export interface ForumMembership {
  userId: string;
  role: ForumRole;
}

export interface ForumDataset {
  users: ForumUser[];
  nodes: ForumNode[];
  builds: Build[];
  blocks: Block[];
  collections: Collection[];
  connections: Connection[];
  revisions: Revision[];
  guardianLinks: GuardianLink[];
  nodeMemberships: NodeMembership[];
  buildCollaborators: BuildCollaborator[];
  forumMemberships: ForumMembership[];
}

export function objectReference(object: ForumObject): ObjectReference {
  return { type: object.kind, id: object.id };
}

export function objectTitle(object: ForumObject): string {
  if (object.kind === "block") {
    return object.title ?? object.description ?? object.type;
  }
  return object.title;
}
