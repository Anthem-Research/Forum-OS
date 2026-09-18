import "server-only";

import { cookies } from "next/headers";
import { forumRepository } from "@/core/repository";
import {
  deploymentMode,
  developmentPreviewEnabled,
  resolvePreviewActorId,
} from "./session-policy";

export const PREVIEW_ACTOR_COOKIE = "forum_preview_actor";

export interface ForumSession {
  actorId: string;
  source: "development-preview";
}

export async function currentForumSession(): Promise<ForumSession | null> {
  if (!developmentPreviewEnabled()) return null;

  const cookieStore = await cookies();
  const actorId = resolvePreviewActorId(
    cookieStore.get(PREVIEW_ACTOR_COOKIE)?.value,
    forumRepository.users(),
  );

  return actorId ? { actorId, source: "development-preview" } : null;
}

export async function currentActorId(): Promise<string | null> {
  return (await currentForumSession())?.actorId ?? null;
}

export function previewIdentityEnabled(): boolean {
  return developmentPreviewEnabled();
}

export { deploymentMode };
