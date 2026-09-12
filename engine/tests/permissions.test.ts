import { describe, expect, it } from "vitest";
import type { Build, ForumDataset } from "@/core/domain";
import { canCurate, canEdit, canView, type PermissionContext } from "@/core/permissions";
import { forumSeed } from "@/core/seed";

function context(actorId: string | null): PermissionContext {
  return {
    actorId,
    guardianLinks: forumSeed.guardianLinks,
    nodeMemberships: forumSeed.nodeMemberships,
    buildCollaborators: forumSeed.buildCollaborators,
    forumMemberships: forumSeed.forumMemberships,
  };
}

function build(id: string): Build {
  const result = forumSeed.builds.find((candidate) => candidate.id === id);
  if (!result) throw new Error(`Missing seed Build ${id}`);
  return result;
}

describe("Forum visibility", () => {
  it("keeps a child's private Build visible to the child and guardian", () => {
    const privateBuild = build("build-deep-sea");
    expect(canView(privateBuild, context("atlas"))).toBe(true);
    expect(canView(privateBuild, context("morgan"))).toBe(true);
  });

  it("does not let curation authority bypass child privacy", () => {
    const privateBuild = build("build-deep-sea");
    expect(canView(privateBuild, context("ines"))).toBe(false);
    expect(canCurate(privateBuild, context("ines"))).toBe(false);
  });

  it("allows Node work only to Node members", () => {
    const thetis = build("build-thetis");
    expect(canView(thetis, context("ines"))).toBe(true);
    const outsider: PermissionContext = { ...context("outsider"), nodeMemberships: [] };
    expect(canView(thetis, outsider)).toBe(false);
  });

  it("allows signed-in members to see Network work, but not anonymous visitors", () => {
    const rover = build("build-garden-rover");
    expect(canView(rover, context("atlas"))).toBe(true);
    expect(canView(rover, context(null))).toBe(false);
  });

  it("lets a guardian edit their child's work", () => {
    expect(canEdit(build("build-deep-sea"), context("morgan"))).toBe(true);
  });

  it("does not treat a Forum admin as an automatic owner", () => {
    const unrelatedData: ForumDataset = forumSeed;
    expect(unrelatedData.forumMemberships.some((entry) => entry.userId === "morgan" && entry.role === "admin")).toBe(true);
    expect(canEdit(build("build-garden-rover"), context("morgan"))).toBe(false);
  });
});
