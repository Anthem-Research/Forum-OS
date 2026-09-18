import type { ForumUser } from "@/core/domain";

export type DeploymentMode = "local" | "connected";

type SessionEnvironment = Readonly<Record<string, string | undefined>>;

export function deploymentMode(environment: SessionEnvironment = process.env): DeploymentMode {
  return environment.FORUM_DEPLOYMENT_MODE === "connected" ? "connected" : "local";
}

export function developmentPreviewEnabled(
  environment: SessionEnvironment = process.env,
): boolean {
  return (
    environment.NODE_ENV !== "production" &&
    deploymentMode(environment) === "local" &&
    environment.FORUM_ENABLE_DEV_ACTOR === "true"
  );
}

export function resolvePreviewActorId(
  candidate: string | null | undefined,
  users: readonly ForumUser[],
  environment: SessionEnvironment = process.env,
): string | null {
  if (!developmentPreviewEnabled(environment) || !candidate) return null;
  return users.some((user) => user.id === candidate) ? candidate : null;
}
