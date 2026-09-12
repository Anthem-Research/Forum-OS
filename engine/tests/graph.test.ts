import { describe, expect, it } from "vitest";
import type { Connection } from "@/core/domain";
import { compose, connectionsTouching, validateConnection } from "@/core/graph";
import { forumSeed } from "@/core/seed";

describe("Forum object graph", () => {
  const objects = [...forumSeed.builds, ...forumSeed.blocks, ...forumSeed.collections];

  it("composes a Build in explicit connection order", () => {
    const contents = compose(
      { type: "build", id: "build-thetis" },
      objects,
      forumSeed.connections,
    );
    expect(contents.map((object) => object.id)).toEqual([
      "block-thetis-drawing",
      "block-thetis-question",
      "block-thetis-observation",
      "block-hull-length",
      "block-mast-test",
      "block-wind-sensor",
    ]);
  });

  it("allows the same Block to accumulate multiple contexts", () => {
    const connections = connectionsTouching(forumSeed.connections, {
      type: "block",
      id: "block-wind-sensor",
    });
    expect(connections.map((connection) => connection.source.id).sort()).toEqual([
      "build-garden-rover",
      "build-thetis",
      "collection-responsive-machines",
      "collection-water-lines",
    ]);
  });

  it("rejects duplicate and self connections", () => {
    const duplicate = forumSeed.connections[0];
    expect(validateConnection(duplicate, objects, forumSeed.connections)).toContain(
      "This connection already exists.",
    );

    const self: Connection = {
      id: "self",
      source: { type: "build", id: "build-thetis" },
      target: { type: "build", id: "build-thetis" },
      relationship: "related",
      createdBy: "atlas",
      createdAt: "2026-09-09T00:00:00.000Z",
    };
    expect(validateConnection(self, objects, forumSeed.connections)).toContain(
      "An object cannot connect to itself.",
    );
  });
});
