import { describe, expect, it } from "vitest";
import {
  deploymentMode,
  developmentPreviewEnabled,
  resolvePreviewActorId,
} from "@/auth/session-policy";
import { forumSeed } from "@/core/seed";

const localDevelopment = {
  NODE_ENV: "development",
  FORUM_DEPLOYMENT_MODE: "local",
  FORUM_ENABLE_DEV_ACTOR: "true",
};

describe("Forum session policy", () => {
  it("enables preview identities only when local development opts in", () => {
    expect(developmentPreviewEnabled(localDevelopment)).toBe(true);
    expect(developmentPreviewEnabled({ ...localDevelopment, NODE_ENV: "production" })).toBe(false);
    expect(developmentPreviewEnabled({ ...localDevelopment, FORUM_DEPLOYMENT_MODE: "connected" })).toBe(false);
    expect(developmentPreviewEnabled({ ...localDevelopment, FORUM_ENABLE_DEV_ACTOR: "false" })).toBe(false);
  });

  it("fails closed for missing and unknown preview actors", () => {
    expect(resolvePreviewActorId(null, forumSeed.users, localDevelopment)).toBeNull();
    expect(resolvePreviewActorId("unknown", forumSeed.users, localDevelopment)).toBeNull();
    expect(resolvePreviewActorId("atlas", forumSeed.users, localDevelopment)).toBe("atlas");
  });

  it("never accepts a preview cookie in production", () => {
    expect(
      resolvePreviewActorId("atlas", forumSeed.users, {
        ...localDevelopment,
        NODE_ENV: "production",
      }),
    ).toBeNull();
  });

  it("defaults to the local deployment profile", () => {
    expect(deploymentMode({})).toBe("local");
    expect(deploymentMode({ FORUM_DEPLOYMENT_MODE: "connected" })).toBe("connected");
  });
});
