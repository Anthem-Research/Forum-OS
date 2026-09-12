import type { ForumObject } from "@/core/domain";
import { objectTitle } from "@/core/domain";
import { forumRepository } from "@/core/repository";
import { ObjectLink } from "./ObjectLink";

export function ObjectIndex({ objects }: { objects: ForumObject[] }) {
  return (
    <ol className="object-index">
      {objects.map((object) => {
        const creator = forumRepository.userById(object.creatorId);
        return (
          <li key={`${object.kind}-${object.id}`}>
            <ObjectLink object={object}>
              <span className="index-type">{object.kind}</span>
              <span className="index-title">{objectTitle(object)}</span>
              <span className="index-maker">{creator?.displayName}</span>
              <span className="index-status">{object.curationStatus === "none" ? object.visibility : object.curationStatus}</span>
            </ObjectLink>
          </li>
        );
      })}
    </ol>
  );
}
