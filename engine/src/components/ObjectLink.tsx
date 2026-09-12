import Link from "next/link";
import type { ForumObject } from "@/core/domain";

export function objectHref(object: ForumObject): string {
  switch (object.kind) {
    case "build":
      return `/build/${object.slug}`;
    case "collection":
      return `/collection/${object.slug}`;
    case "block":
      return `/block/${object.id}`;
  }
}

export function ObjectLink({ object, children }: { object: ForumObject; children: React.ReactNode }) {
  return <Link href={objectHref(object)}>{children}</Link>;
}
