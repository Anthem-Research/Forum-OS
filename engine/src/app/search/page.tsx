import { SearchSurface } from "@/components/SearchSurface";
import { objectTitle } from "@/core/domain";
import { forumRepository } from "@/core/repository";

export const metadata = { title: "Search" };

export default function SearchPage() {
  const items = forumRepository.accessibleObjects(null).map((object) => ({
    id: `${object.kind}-${object.id}`,
    kind: object.kind,
    title: objectTitle(object),
    description: object.description ?? "",
    href: object.kind === "build"
      ? `/build/${object.slug}`
      : object.kind === "collection"
        ? `/collection/${object.slug}`
        : `/block/${object.id}`,
  }));

  return <SearchSurface items={items} />;
}
