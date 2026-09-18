export type WorkspaceObjectKind = "note" | "question" | "reference" | "measurement";

export interface WorkspaceVersion {
  id: string;
  number: number;
  title: string;
  body: string;
  url?: string;
  value?: string;
  unit?: string;
  message: string;
  createdAt: string;
}

export interface WorkspaceObject {
  id: string;
  kind: WorkspaceObjectKind;
  title: string;
  body: string;
  url?: string;
  value?: string;
  unit?: string;
  versions: WorkspaceVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSpace {
  id: string;
  title: string;
  description: string;
  objectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceState {
  schemaVersion: 1;
  ownerId: string;
  spaces: WorkspaceSpace[];
  objects: WorkspaceObject[];
  updatedAt: string;
}

export interface WorkspaceObjectDraft {
  kind: WorkspaceObjectKind;
  title: string;
  body: string;
  url?: string;
  value?: string;
  unit?: string;
}

type MutationContext = { id: string; now: string };

function versionFrom(
  object: Pick<WorkspaceObject, "title" | "body" | "url" | "value" | "unit">,
  number: number,
  context: MutationContext,
  message: string,
): WorkspaceVersion {
  return {
    id: context.id,
    number,
    title: object.title,
    body: object.body,
    url: object.url,
    value: object.value,
    unit: object.unit,
    message,
    createdAt: context.now,
  };
}

export function starterWorkspace(ownerId: string): WorkspaceState {
  const now = "2026-09-18T00:00:00.000Z";
  const question: WorkspaceObject = {
    id: "starter-weight-question",
    kind: "question",
    title: "How does moving weight change the bow?",
    body: "Keep the question connected to every place where it becomes useful. Replace this starter text with an observation from the real build.",
    versions: [],
    createdAt: now,
    updatedAt: now,
  };
  question.versions = [
    versionFrom(question, 1, { id: "starter-weight-question-v1", now }, "Starter version"),
  ];

  const note: WorkspaceObject = {
    id: "starter-field-note",
    kind: "note",
    title: "First field note",
    body: "Record what happened, what changed, and what you want to try next. This stays on this device until you export it.",
    versions: [],
    createdAt: now,
    updatedAt: now,
  };
  note.versions = [versionFrom(note, 1, { id: "starter-field-note-v1", now }, "Starter version")];

  return {
    schemaVersion: 1,
    ownerId,
    spaces: [
      {
        id: "starter-thetis",
        title: "Thetis",
        description: "The physical boat, tests, questions and changes.",
        objectIds: [question.id, note.id],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "starter-water",
        title: "Water / movement",
        description: "A connected inquiry across boats, tides, weather and games.",
        objectIds: [question.id],
        createdAt: now,
        updatedAt: now,
      },
    ],
    objects: [question, note],
    updatedAt: now,
  };
}

export function createSpace(
  state: WorkspaceState,
  input: { title: string; description: string },
  context: MutationContext,
): WorkspaceState {
  const title = input.title.trim();
  if (!title) return state;
  return {
    ...state,
    spaces: [
      ...state.spaces,
      {
        id: context.id,
        title,
        description: input.description.trim(),
        objectIds: [],
        createdAt: context.now,
        updatedAt: context.now,
      },
    ],
    updatedAt: context.now,
  };
}

export function createObject(
  state: WorkspaceState,
  spaceId: string,
  draft: WorkspaceObjectDraft,
  context: MutationContext & { versionId: string },
): WorkspaceState {
  const space = state.spaces.find((candidate) => candidate.id === spaceId);
  const title = draft.title.trim();
  if (!space || !title) return state;

  const object: WorkspaceObject = {
    id: context.id,
    kind: draft.kind,
    title,
    body: draft.body.trim(),
    url: draft.url?.trim() || undefined,
    value: draft.value?.trim() || undefined,
    unit: draft.unit?.trim() || undefined,
    versions: [],
    createdAt: context.now,
    updatedAt: context.now,
  };
  object.versions = [
    versionFrom(object, 1, { id: context.versionId, now: context.now }, "Created"),
  ];

  return {
    ...state,
    objects: [...state.objects, object],
    spaces: state.spaces.map((candidate) =>
      candidate.id === spaceId
        ? { ...candidate, objectIds: [...candidate.objectIds, object.id], updatedAt: context.now }
        : candidate,
    ),
    updatedAt: context.now,
  };
}

export function connectObject(
  state: WorkspaceState,
  objectId: string,
  spaceId: string,
  now: string,
): WorkspaceState {
  if (!state.objects.some((object) => object.id === objectId)) return state;
  const target = state.spaces.find((space) => space.id === spaceId);
  if (!target || target.objectIds.includes(objectId)) return state;
  return {
    ...state,
    spaces: state.spaces.map((space) =>
      space.id === spaceId
        ? { ...space, objectIds: [...space.objectIds, objectId], updatedAt: now }
        : space,
    ),
    updatedAt: now,
  };
}

export function updateObject(
  state: WorkspaceState,
  objectId: string,
  draft: Omit<WorkspaceObjectDraft, "kind">,
  context: MutationContext,
  message = "Changed",
): WorkspaceState {
  if (!draft.title.trim()) return state;
  let changed = false;
  const objects = state.objects.map((object) => {
    if (object.id !== objectId) return object;
    changed = true;
    const updated: WorkspaceObject = {
      ...object,
      title: draft.title.trim(),
      body: draft.body.trim(),
      url: draft.url?.trim() || undefined,
      value: draft.value?.trim() || undefined,
      unit: draft.unit?.trim() || undefined,
      updatedAt: context.now,
    };
    return {
      ...updated,
      versions: [
        ...object.versions,
        versionFrom(updated, object.versions.length + 1, context, message),
      ],
    };
  });
  return changed ? { ...state, objects, updatedAt: context.now } : state;
}

export function restoreVersion(
  state: WorkspaceState,
  objectId: string,
  versionId: string,
  context: MutationContext,
): WorkspaceState {
  const object = state.objects.find((candidate) => candidate.id === objectId);
  const version = object?.versions.find((candidate) => candidate.id === versionId);
  if (!object || !version) return state;
  return updateObject(
    state,
    objectId,
    {
      title: version.title,
      body: version.body,
      url: version.url,
      value: version.value,
      unit: version.unit,
    },
    context,
    `Restored version ${version.number}`,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function parseVersion(value: unknown): WorkspaceVersion {
  if (!isRecord(value)) throw new Error("A saved version is invalid.");
  const required = ["id", "title", "body", "message", "createdAt"] as const;
  if (required.some((key) => typeof value[key] !== "string") || typeof value.number !== "number") {
    throw new Error("A saved version is incomplete.");
  }
  return value as unknown as WorkspaceVersion;
}

function parseObject(value: unknown): WorkspaceObject {
  if (!isRecord(value)) throw new Error("A saved object is invalid.");
  const required = ["id", "kind", "title", "body", "createdAt", "updatedAt"] as const;
  if (required.some((key) => typeof value[key] !== "string") || !Array.isArray(value.versions)) {
    throw new Error("A saved object is incomplete.");
  }
  if (!["note", "question", "reference", "measurement"].includes(value.kind as string)) {
    throw new Error("A saved object has an unsupported type.");
  }
  return { ...(value as unknown as WorkspaceObject), versions: value.versions.map(parseVersion) };
}

function parseSpace(value: unknown): WorkspaceSpace {
  if (!isRecord(value)) throw new Error("A saved space is invalid.");
  const required = ["id", "title", "description", "createdAt", "updatedAt"] as const;
  if (required.some((key) => typeof value[key] !== "string") || !isStringArray(value.objectIds)) {
    throw new Error("A saved space is incomplete.");
  }
  return value as unknown as WorkspaceSpace;
}

export function parseWorkspaceBackup(text: string, ownerId: string): WorkspaceState {
  const value: unknown = JSON.parse(text);
  if (!isRecord(value) || value.schemaVersion !== 1 || value.ownerId !== ownerId) {
    throw new Error("This is not a Forum backup for the current identity.");
  }
  if (!Array.isArray(value.spaces) || !Array.isArray(value.objects) || typeof value.updatedAt !== "string") {
    throw new Error("The Forum backup is incomplete.");
  }
  const objects = value.objects.map(parseObject);
  const spaces = value.spaces.map(parseSpace);
  const objectIds = new Set(objects.map((object) => object.id));
  if (spaces.some((space) => space.objectIds.some((id) => !objectIds.has(id)))) {
    throw new Error("The Forum backup contains a broken connection.");
  }
  return { schemaVersion: 1, ownerId, spaces, objects, updatedAt: value.updatedAt };
}

export function serializeWorkspace(state: WorkspaceState): string {
  return `${JSON.stringify(state, null, 2)}\n`;
}
