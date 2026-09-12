import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectGrid } from "@/components/ObjectGrid";
import { currentActorId, forumRepository } from "@/core/repository";

type CollectionPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: forumRepository.collectionBySlug(slug, currentActorId())?.title ?? "Collection" };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const actorId = currentActorId();
  const collection = forumRepository.collectionBySlug(slug, actorId);
  if (!collection) notFound();
  const creator = forumRepository.userById(collection.creatorId);
  const contents = forumRepository.contents(collection, actorId);

  return (
    <main className="object-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Network</Link><span>/</span><span>Collection</span></nav>
      <header className="collection-header">
        <p className="eyebrow">Collection · {collection.visibility}</p>
        <h1>{collection.title}</h1>
        <p>{collection.description}</p>
        <p className="byline">Composed by <Link href={`/person/${creator?.username}`}>{creator?.displayName}</Link></p>
      </header>
      <ObjectGrid objects={contents} />
    </main>
  );
}
