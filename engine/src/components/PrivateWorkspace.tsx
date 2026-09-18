"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  connectObject,
  createObject,
  createSpace,
  parseWorkspaceBackup,
  restoreVersion,
  serializeWorkspace,
  starterWorkspace,
  updateObject,
  type WorkspaceObject,
  type WorkspaceObjectDraft,
  type WorkspaceObjectKind,
  type WorkspaceState,
} from "@/workspace/model";
import { loadWorkspace, saveWorkspace } from "@/workspace/browser-storage";

const emptyDraft: WorkspaceObjectDraft = { kind: "note", title: "", body: "" };
const objectKinds: { value: WorkspaceObjectKind; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "question", label: "Question" },
  { value: "reference", label: "Reference" },
  { value: "measurement", label: "Measurement" },
];

const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function downloadBackup(state: WorkspaceState) {
  const blob = new Blob([serializeWorkspace(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `forum-workspace-${state.ownerId}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ObjectFields({
  draft,
  onChange,
  showKind = true,
}: {
  draft: WorkspaceObjectDraft;
  onChange: (draft: WorkspaceObjectDraft) => void;
  showKind?: boolean;
}) {
  return (
    <div className="workspace-fields">
      {showKind ? (
        <label>
          Type
          <select
            value={draft.kind}
            onChange={(event) => onChange({ ...draft, kind: event.target.value as WorkspaceObjectKind })}
          >
            {objectKinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
          </select>
        </label>
      ) : null}
      <label>
        Title
        <input
          required
          value={draft.title}
          onChange={(event) => onChange({ ...draft, title: event.target.value })}
        />
      </label>
      <label>
        {draft.kind === "reference" ? "Why it matters" : "Working note"}
        <textarea value={draft.body} onChange={(event) => onChange({ ...draft, body: event.target.value })} />
      </label>
      {draft.kind === "reference" ? (
        <label>
          Address
          <input type="url" value={draft.url ?? ""} onChange={(event) => onChange({ ...draft, url: event.target.value })} />
        </label>
      ) : null}
      {draft.kind === "measurement" ? (
        <div className="workspace-measurement-fields">
          <label>
            Value
            <input value={draft.value ?? ""} onChange={(event) => onChange({ ...draft, value: event.target.value })} />
          </label>
          <label>
            Unit
            <input value={draft.unit ?? ""} onChange={(event) => onChange({ ...draft, unit: event.target.value })} />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function objectDraft(object: WorkspaceObject): WorkspaceObjectDraft {
  return {
    kind: object.kind,
    title: object.title,
    body: object.body,
    url: object.url,
    value: object.value,
    unit: object.unit,
  };
}

export function PrivateWorkspace({ ownerId, ownerName }: { ownerId: string; ownerName: string }) {
  const [workspace, setWorkspace] = useState(() => starterWorkspace(ownerId));
  const [ready, setReady] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState("starter-thetis");
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [spaceDraft, setSpaceDraft] = useState({ title: "", description: "" });
  const [draft, setDraft] = useState<WorkspaceObjectDraft>(emptyDraft);
  const [editDraft, setEditDraft] = useState<WorkspaceObjectDraft | null>(null);
  const [connectTo, setConnectTo] = useState("");
  const [notice, setNotice] = useState("");
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadWorkspace(ownerId);
      setWorkspace(stored);
      setSelectedSpaceId(stored.spaces[0]?.id ?? "");
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ownerId]);

  useEffect(() => {
    if (ready) saveWorkspace(workspace);
  }, [ready, workspace]);

  const selectedSpace = workspace.spaces.find((space) => space.id === selectedSpaceId);
  const selectedObject = workspace.objects.find((object) => object.id === selectedObjectId);
  const spaceObjects = useMemo(
    () => selectedSpace?.objectIds.flatMap((id) => workspace.objects.find((object) => object.id === id) ?? []) ?? [],
    [selectedSpace, workspace.objects],
  );
  const connectedSpaces = selectedObject
    ? workspace.spaces.filter((space) => space.objectIds.includes(selectedObject.id))
    : [];
  const availableSpaces = selectedObject
    ? workspace.spaces.filter((space) => !space.objectIds.includes(selectedObject.id))
    : [];

  function commitWorkspace(next: WorkspaceState) {
    saveWorkspace(next);
    setWorkspace(next);
  }

  function chooseObject(object: WorkspaceObject) {
    setSelectedObjectId(object.id);
    setEditDraft(objectDraft(object));
    setConnectTo("");
    setNotice("");
  }

  function addSpace(event: React.FormEvent) {
    event.preventDefault();
    const id = newId();
    const next = createSpace(workspace, spaceDraft, { id, now: now() });
    if (next !== workspace) {
      commitWorkspace(next);
      setSelectedSpaceId(id);
      setSelectedObjectId(null);
      setSpaceDraft({ title: "", description: "" });
    }
  }

  function addObject(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSpace) return;
    const id = newId();
    const next = createObject(workspace, selectedSpace.id, draft, {
      id,
      versionId: newId(),
      now: now(),
    });
    if (next !== workspace) {
      commitWorkspace(next);
      setDraft(emptyDraft);
      const added = next.objects.find((object) => object.id === id);
      if (added) chooseObject(added);
    }
  }

  function saveObject(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedObject || !editDraft) return;
    const next = updateObject(workspace, selectedObject.id, editDraft, { id: newId(), now: now() });
    commitWorkspace(next);
    setNotice("Version saved on this device.");
  }

  function addConnection() {
    if (!selectedObject || !connectTo) return;
    commitWorkspace(connectObject(workspace, selectedObject.id, connectTo, now()));
    setConnectTo("");
    setNotice("Object connected without making a copy.");
  }

  async function importBackup(file: File) {
    try {
      const next = parseWorkspaceBackup(await file.text(), ownerId);
      if (!window.confirm("Restore this backup and replace the current local workspace?")) return;
      commitWorkspace(next);
      setSelectedSpaceId(next.spaces[0]?.id ?? "");
      setSelectedObjectId(null);
      setNotice("Backup restored on this device.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The backup could not be restored.");
    } finally {
      if (importInput.current) importInput.current.value = "";
    }
  }

  if (!ready) {
    return (
      <main className="message-page" aria-live="polite">
        <p className="eyebrow">Private workspace</p>
        <h1>Opening work saved on this device.</h1>
      </main>
    );
  }

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">PRIVATE WORKSPACE · {ownerName}</p>
          <h1>Work before it becomes public.</h1>
        </div>
        <div className="workspace-privacy-note">
          <p>Saved only in this browser profile. Nothing here enters the Network or Library.</p>
          <p>This prototype is local-first, not encrypted and not a strict air gap.</p>
          <div className="workspace-actions">
            <button type="button" onClick={() => downloadBackup(workspace)}>Export backup</button>
            <label className="button-label">
              Restore backup
              <input
                ref={importInput}
                accept="application/json,.json"
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importBackup(file);
                }}
              />
            </label>
          </div>
        </div>
      </header>

      <div className="workspace-shell">
        <aside className="workspace-spaces" aria-label="Spaces">
          <div className="workspace-panel-heading">
            <p className="eyebrow">Spaces</p>
            <span>{workspace.spaces.length}</span>
          </div>
          <nav>
            {workspace.spaces.map((space) => (
              <button
                className={space.id === selectedSpaceId ? "is-active" : ""}
                key={space.id}
                onClick={() => {
                  setSelectedSpaceId(space.id);
                  setSelectedObjectId(null);
                  setNotice("");
                }}
                type="button"
              >
                <span>{space.title}</span>
                <small>{space.objectIds.length} objects</small>
              </button>
            ))}
          </nav>
          <details className="workspace-create">
            <summary>New space</summary>
            <form onSubmit={addSpace}>
              <label>
                Title
                <input required value={spaceDraft.title} onChange={(event) => setSpaceDraft({ ...spaceDraft, title: event.target.value })} />
              </label>
              <label>
                Description
                <textarea value={spaceDraft.description} onChange={(event) => setSpaceDraft({ ...spaceDraft, description: event.target.value })} />
              </label>
              <button type="submit">Create space</button>
            </form>
          </details>
        </aside>

        <section className="workspace-current" aria-live="polite">
          {selectedSpace ? (
            <>
              <header>
                <p className="eyebrow">Private space</p>
                <h2>{selectedSpace.title}</h2>
                <p>{selectedSpace.description || "An open space for connected work."}</p>
              </header>
              <div className="workspace-object-list">
                {spaceObjects.map((object) => (
                  <button key={object.id} onClick={() => chooseObject(object)} type="button">
                    <span className="eyebrow">{object.kind}</span>
                    <strong>{object.title}</strong>
                    {object.kind === "measurement" && object.value ? (
                      <span className="workspace-value">{object.value} <small>{object.unit}</small></span>
                    ) : (
                      <span>{object.body}</span>
                    )}
                    <small>
                      {workspace.spaces.filter((space) => space.objectIds.includes(object.id)).length} spaces · {object.versions.length} versions
                    </small>
                  </button>
                ))}
                {spaceObjects.length === 0 ? <p className="workspace-empty">Add the first working object below.</p> : null}
              </div>
              <details className="workspace-create workspace-add-object">
                <summary>Add object</summary>
                <form onSubmit={addObject}>
                  <ObjectFields draft={draft} onChange={setDraft} />
                  <button type="submit">Add to {selectedSpace.title}</button>
                </form>
              </details>
            </>
          ) : <p className="workspace-empty">Create a space to begin.</p>}
        </section>

        <aside className="workspace-inspector" aria-label="Object inspector">
          {selectedObject && editDraft ? (
            <>
              <div className="workspace-panel-heading">
                <p className="eyebrow">Selected object</p>
                <button type="button" onClick={() => setSelectedObjectId(null)}>Close</button>
              </div>
              <form onSubmit={saveObject}>
                <ObjectFields draft={editDraft} onChange={setEditDraft} showKind={false} />
                <button type="submit">Save version</button>
              </form>
              {notice ? <p className="workspace-notice">{notice}</p> : null}
              <section className="workspace-connections">
                <h3>Appears in</h3>
                <ul>{connectedSpaces.map((space) => <li key={space.id}>{space.title}</li>)}</ul>
                {availableSpaces.length > 0 ? (
                  <div>
                    <select aria-label="Connect object to another space" value={connectTo} onChange={(event) => setConnectTo(event.target.value)}>
                      <option value="">Choose another space</option>
                      {availableSpaces.map((space) => <option key={space.id} value={space.id}>{space.title}</option>)}
                    </select>
                    <button disabled={!connectTo} onClick={addConnection} type="button">Connect</button>
                  </div>
                ) : null}
              </section>
              <section className="workspace-history">
                <h3>Versions</h3>
                {[...selectedObject.versions].reverse().map((version) => (
                  <div key={version.id}>
                    <span>Version {version.number}</span>
                    <span>{version.message}</span>
                    {version.number !== selectedObject.versions.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          const next = restoreVersion(workspace, selectedObject.id, version.id, { id: newId(), now: now() });
                          commitWorkspace(next);
                          const restored = next.objects.find((object) => object.id === selectedObject.id);
                          if (restored) setEditDraft(objectDraft(restored));
                          setNotice(`Version ${version.number} restored as a new version.`);
                        }}
                      >
                        Restore
                      </button>
                    ) : <small>Current</small>}
                  </div>
                ))}
              </section>
            </>
          ) : (
            <div className="workspace-inspector-empty">
              <p className="eyebrow">Objects stay themselves</p>
              <p>Select an object to change it, recover an earlier version, or connect it to another space without duplication.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
