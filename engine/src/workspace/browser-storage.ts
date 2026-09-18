import type { WorkspaceState } from "./model";
import { parseWorkspaceBackup, starterWorkspace } from "./model";

const keyFor = (ownerId: string) => `forum:workspace:v1:${ownerId}`;

export function loadWorkspace(ownerId: string): WorkspaceState {
  const stored = window.localStorage.getItem(keyFor(ownerId));
  if (!stored) return starterWorkspace(ownerId);
  try {
    return parseWorkspaceBackup(stored, ownerId);
  } catch {
    return starterWorkspace(ownerId);
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  window.localStorage.setItem(keyFor(state.ownerId), JSON.stringify(state));
}
