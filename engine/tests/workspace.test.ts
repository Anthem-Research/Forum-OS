import { describe, expect, it } from "vitest";
import {
  connectObject,
  createObject,
  createSpace,
  parseWorkspaceBackup,
  restoreVersion,
  serializeWorkspace,
  starterWorkspace,
  updateObject,
} from "@/workspace/model";

describe("private workspace", () => {
  it("connects one object to multiple spaces without duplicating it", () => {
    let state = starterWorkspace("atlas");
    state = createSpace(state, { title: "Games", description: "Playable water systems" }, { id: "games", now: "2026-09-19" });
    state = connectObject(state, "starter-weight-question", "games", "2026-09-19");

    expect(state.objects.filter((object) => object.id === "starter-weight-question")).toHaveLength(1);
    expect(state.spaces.filter((space) => space.objectIds.includes("starter-weight-question"))).toHaveLength(3);
  });

  it("saves and restores object versions as new history", () => {
    let state = starterWorkspace("atlas");
    state = updateObject(
      state,
      "starter-field-note",
      { title: "Field note", body: "The bow rose." },
      { id: "v2", now: "2026-09-19" },
    );
    state = restoreVersion(state, "starter-field-note", "starter-field-note-v1", { id: "v3", now: "2026-09-20" });

    const object = state.objects.find((candidate) => candidate.id === "starter-field-note");
    expect(object?.versions).toHaveLength(3);
    expect(object?.body).toContain("Record what happened");
    expect(object?.versions[2]?.message).toBe("Restored version 1");
  });

  it("round trips a valid backup for the same identity", () => {
    let state = starterWorkspace("atlas");
    state = createObject(
      state,
      "starter-thetis",
      { kind: "measurement", title: "Bow height", body: "At rest", value: "42", unit: "cm" },
      { id: "bow-height", versionId: "bow-height-v1", now: "2026-09-19" },
    );
    expect(parseWorkspaceBackup(serializeWorkspace(state), "atlas")).toEqual(state);
    expect(() => parseWorkspaceBackup(serializeWorkspace(state), "morgan")).toThrow(/current identity/);
  });
});
