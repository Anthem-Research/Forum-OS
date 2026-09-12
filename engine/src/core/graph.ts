import type { Connection, ForumObject, ObjectReference } from "./domain";

function sameReference(left: ObjectReference, right: ObjectReference): boolean {
  return left.type === right.type && left.id === right.id;
}

export function connectionsFrom(
  connections: Connection[],
  source: ObjectReference,
  relationship?: Connection["relationship"],
): Connection[] {
  return connections
    .filter(
      (connection) =>
        sameReference(connection.source, source) &&
        (!relationship || connection.relationship === relationship),
    )
    .sort((left, right) => (left.position ?? 0) - (right.position ?? 0));
}

export function connectionsTouching(
  connections: Connection[],
  object: ObjectReference,
): Connection[] {
  return connections.filter(
    (connection) =>
      sameReference(connection.source, object) || sameReference(connection.target, object),
  );
}

export function compose(
  source: ObjectReference,
  objects: ForumObject[],
  connections: Connection[],
): ForumObject[] {
  const targets = connectionsFrom(connections, source, "contains").map(
    (connection) => connection.target,
  );
  return targets.flatMap((target) => {
    const object = objects.find(
      (candidate) => candidate.kind === target.type && candidate.id === target.id,
    );
    return object ? [object] : [];
  });
}

export function validateConnection(
  candidate: Connection,
  objects: ForumObject[],
  existing: Connection[],
): string[] {
  const errors: string[] = [];
  if (sameReference(candidate.source, candidate.target)) {
    errors.push("An object cannot connect to itself.");
  }
  for (const reference of [candidate.source, candidate.target]) {
    if (!objects.some((object) => object.kind === reference.type && object.id === reference.id)) {
      errors.push(`Missing ${reference.type} ${reference.id}.`);
    }
  }
  if (
    existing.some(
      (connection) =>
        sameReference(connection.source, candidate.source) &&
        sameReference(connection.target, candidate.target) &&
        connection.relationship === candidate.relationship,
    )
  ) {
    errors.push("This connection already exists.");
  }
  return errors;
}
