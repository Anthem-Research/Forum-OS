import type {
  BuildCollaborator,
  ForumMembership,
  ForumObject,
  GuardianLink,
  NodeMembership,
} from "./domain";

export interface PermissionContext {
  actorId: string | null;
  guardianLinks: GuardianLink[];
  nodeMemberships: NodeMembership[];
  buildCollaborators: BuildCollaborator[];
  forumMemberships: ForumMembership[];
  parentBuildIds?: string[];
}

function isOwnerOrGuardian(object: ForumObject, context: PermissionContext): boolean {
  if (!context.actorId) return false;
  if (object.creatorId === context.actorId) return true;
  return context.guardianLinks.some(
    (link) => link.guardianId === context.actorId && link.childId === object.creatorId,
  );
}

function relevantBuildIds(object: ForumObject, context: PermissionContext): string[] {
  return object.kind === "build" ? [object.id] : (context.parentBuildIds ?? []);
}

function isCollaborator(object: ForumObject, context: PermissionContext): boolean {
  if (!context.actorId) return false;
  const buildIds = relevantBuildIds(object, context);
  return context.buildCollaborators.some(
    (entry) => entry.userId === context.actorId && buildIds.includes(entry.buildId),
  );
}

function isNodeMember(object: ForumObject, context: PermissionContext): boolean {
  if (!context.actorId || !object.nodeId) return false;
  return context.nodeMemberships.some(
    (entry) => entry.userId === context.actorId && entry.nodeId === object.nodeId,
  );
}

function isForumMember(context: PermissionContext): boolean {
  if (!context.actorId) return false;
  return context.forumMemberships.some((entry) => entry.userId === context.actorId);
}

export function canView(object: ForumObject, context: PermissionContext): boolean {
  if (object.visibility === "public") return true;
  if (isOwnerOrGuardian(object, context)) return true;
  if (!context.actorId) return false;

  switch (object.visibility) {
    case "private":
      return false;
    case "project":
      return isCollaborator(object, context);
    case "node":
      return isNodeMember(object, context);
    case "network":
      return isForumMember(context);
  }
}

export function canEdit(object: ForumObject, context: PermissionContext): boolean {
  if (isOwnerOrGuardian(object, context)) return true;
  if (!context.actorId) return false;
  const buildIds = relevantBuildIds(object, context);
  return context.buildCollaborators.some(
    (entry) =>
      entry.userId === context.actorId &&
      buildIds.includes(entry.buildId) &&
      (entry.role === "contributor" || entry.role === "owner"),
  );
}

export function canCurate(object: ForumObject, context: PermissionContext): boolean {
  if (!context.actorId || !canView(object, context)) return false;
  return context.forumMemberships.some(
    (entry) =>
      entry.userId === context.actorId &&
      (entry.role === "curator" || entry.role === "admin"),
  );
}
