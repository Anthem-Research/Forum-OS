import type { ForumObject } from "@/core/domain";
import { forumRepository } from "@/core/repository";
import { BlockRenderer } from "./BlockRenderer";
import { ObjectLink } from "./ObjectLink";

function ObjectTile({ object, index }: { object: Exclude<ForumObject, { kind: "block" }>; index: number }) {
  const creator = forumRepository.userById(object.creatorId);
  const node = object.nodeId ? forumRepository.nodeById(object.nodeId) : undefined;
  return (
    <ObjectLink object={object}>
      <article className={`object-tile tile-${(index % 4) + 1}`}>
        <p className="eyebrow">
          {object.kind}
          {object.curationStatus !== "none" ? ` · Forum ${object.curationStatus}` : ""}
        </p>
        <h3>{object.title}</h3>
        <p>{object.description}</p>
        <footer>
          <span>{creator?.displayName}</span>
          <span>{node?.name}</span>
        </footer>
      </article>
    </ObjectLink>
  );
}

export function ObjectGrid({ objects }: { objects: ForumObject[] }) {
  return (
    <div className="object-grid">
      {objects.map((object, index) =>
        object.kind === "block" ? (
          <BlockRenderer block={object} key={`${object.kind}-${object.id}`} />
        ) : (
          <ObjectTile object={object} index={index} key={`${object.kind}-${object.id}`} />
        ),
      )}
    </div>
  );
}
