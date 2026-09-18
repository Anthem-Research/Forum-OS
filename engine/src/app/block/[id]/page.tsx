import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentActorId } from "@/auth/session";
import { BlockRenderer } from "@/components/BlockRenderer";
import { ObjectIndex } from "@/components/ObjectIndex";
import { forumRepository } from "@/core/repository";

type BlockPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: BlockPageProps): Promise<Metadata> {
  const { id } = await params;
  const actorId = await currentActorId();
  const object = forumRepository.object({ type: "block", id });
  return {
    title:
      object?.kind === "block" && forumRepository.canActorView(object, actorId)
        ? object.title ?? "Block"
        : "Block",
  };
}

export default async function BlockPage({ params }: BlockPageProps) {
  const { id } = await params;
  const actorId = await currentActorId();
  const object = forumRepository.object({ type: "block", id });
  if (!object || object.kind !== "block" || !forumRepository.canActorView(object, actorId)) notFound();
  const creator = forumRepository.userById(object.creatorId);
  const connected = forumRepository.connectedObjects(object, actorId);

  return (
    <main className="object-page block-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Network</Link><span>/</span><span>Block</span>
      </nav>
      <header className="detail-header">
        <p className="eyebrow">{object.type} · {object.visibility}</p>
        <h1>{object.title ?? object.type}</h1>
        <p>Added by <Link href={`/person/${creator?.username}`}>{creator?.displayName}</Link></p>
      </header>
      <section className="block-focus">
        <BlockRenderer block={object} linked={false} />
      </section>
      <section className="connections-section" aria-labelledby="connections-title">
        <header className="section-header">
          <h2 id="connections-title">Appears in / connects to</h2>
          <span>{connected.length} contexts</span>
        </header>
        <ObjectIndex objects={connected} />
      </section>
    </main>
  );
}
