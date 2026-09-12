import { describe, expect, it } from "vitest";
import { ForumRepository } from "@/core/repository";
import { forumSeed } from "@/core/seed";

describe("Forum repository", () => {
  const repository = new ForumRepository(forumSeed);

  it("does not return inaccessible objects by slug", () => {
    expect(repository.buildBySlug("deep-sea", "ines")).toBeUndefined();
    expect(repository.buildBySlug("deep-sea", "atlas")?.title).toBe("Deep Sea");
  });

  it("filters search through permissions before matching", () => {
    expect(repository.search("shark", "ines")).toEqual([]);
    expect(repository.search("shark", "atlas").map((object) => object.id)).toEqual([
      "block-shark-bug",
    ]);
  });

  it("keeps curation independent from visibility", () => {
    const selected = repository.selected("atlas");
    expect(selected.some((object) => object.id === "build-thetis")).toBe(true);
    expect(repository.buildBySlug("thetis", null)).toBeUndefined();
  });
});
