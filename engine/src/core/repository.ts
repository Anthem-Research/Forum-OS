import type {
  Build,
  Collection,
  ForumDataset,
  ForumObject,
  ForumUser,
  ObjectReference,
} from "./domain";
import { compose, connectionsTouching } from "./graph";
import { canView, type PermissionContext } from "./permissions";
import { forumSeed } from "./seed";

export class ForumRepository {
  constructor(private readonly data: ForumDataset) {}

  private basePermissionContext(actorId: string | null): PermissionContext {
    return {
      actorId,
      guardianLinks: this.data.guardianLinks,
      nodeMemberships: this.data.nodeMemberships,
      buildCollaborators: this.data.buildCollaborators,
      forumMemberships: this.data.forumMemberships,
    };
  }

  allObjects(): ForumObject[] {
    return [...this.data.builds, ...this.data.blocks, ...this.data.collections];
  }

  userById(id: string): ForumUser | undefined {
    return this.data.users.find((user) => user.id === id);
  }

  userByUsername(username: string): ForumUser | undefined {
    return this.data.users.find((user) => user.username === username);
  }

  nodeBySlug(slug: string) {
    return this.data.nodes.find((node) => node.slug === slug);
  }

  nodeById(id: string) {
    return this.data.nodes.find((node) => node.id === id);
  }

  object(reference: ObjectReference): ForumObject | undefined {
    return this.allObjects().find(
      (object) => object.kind === reference.type && object.id === reference.id,
    );
  }

  parentBuildIds(objectId: string): string[] {
    return this.data.connections.flatMap((connection) =>
      connection.relationship === "contains" &&
      connection.source.type === "build" &&
      connection.target.id === objectId
        ? [connection.source.id]
        : [],
    );
  }

  canActorView(object: ForumObject, actorId: string | null): boolean {
    return canView(object, {
      ...this.basePermissionContext(actorId),
      parentBuildIds: this.parentBuildIds(object.id),
    });
  }

  accessibleObjects(actorId: string | null): ForumObject[] {
    return this.allObjects().filter((object) => this.canActorView(object, actorId));
  }

  builds(actorId: string | null): Build[] {
    return this.data.builds.filter((build) => this.canActorView(build, actorId));
  }

  buildBySlug(slug: string, actorId: string | null): Build | undefined {
    const build = this.data.builds.find((candidate) => candidate.slug === slug);
    return build && this.canActorView(build, actorId) ? build : undefined;
  }

  collectionBySlug(slug: string, actorId: string | null): Collection | undefined {
    const collection = this.data.collections.find((candidate) => candidate.slug === slug);
    return collection && this.canActorView(collection, actorId) ? collection : undefined;
  }

  contents(object: Build | Collection, actorId: string | null): ForumObject[] {
    return compose(
      { type: object.kind, id: object.id },
      this.allObjects(),
      this.data.connections,
    ).filter((child) => this.canActorView(child, actorId));
  }

  connectedObjects(object: ForumObject, actorId: string | null): ForumObject[] {
    const touching = connectionsTouching(this.data.connections, {
      type: object.kind,
      id: object.id,
    });
    const references = touching.map((connection) =>
      connection.source.type === object.kind && connection.source.id === object.id
        ? connection.target
        : connection.source,
    );
    return references.flatMap((reference) => {
      const connected = this.object(reference);
      return connected && this.canActorView(connected, actorId) ? [connected] : [];
    });
  }

  byCreator(userId: string, actorId: string | null): ForumObject[] {
    return this.accessibleObjects(actorId).filter((object) => object.creatorId === userId);
  }

  byNode(nodeId: string, actorId: string | null): ForumObject[] {
    return this.accessibleObjects(actorId).filter((object) => object.nodeId === nodeId);
  }

  selected(actorId: string | null): ForumObject[] {
    return this.accessibleObjects(actorId).filter(
      (object) => object.curationStatus === "selected" || object.curationStatus === "reference",
    );
  }

  search(query: string, actorId: string | null): ForumObject[] {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return this.accessibleObjects(actorId).filter((object) => {
      const text =
        object.kind === "block"
          ? [object.title, object.description, object.payload.body, object.type]
          : [object.title, object.description];
      return text.some((value) => value?.toLocaleLowerCase().includes(needle));
    });
  }

  contributors(build: Build): ForumUser[] {
    return build.contributorIds.flatMap((id) => {
      const user = this.userById(id);
      return user ? [user] : [];
    });
  }

  revisionsFor(object: ForumObject) {
    return this.data.revisions.filter(
      (revision) => revision.object.type === object.kind && revision.object.id === object.id,
    );
  }
}

export const forumRepository = new ForumRepository(forumSeed);

export function currentActorId(): string {
  return process.env.FORUM_DEFAULT_ACTOR_ID ?? "atlas";
}

export function deploymentMode(): "local" | "connected" {
  return process.env.FORUM_DEPLOYMENT_MODE === "connected" ? "connected" : "local";
}
