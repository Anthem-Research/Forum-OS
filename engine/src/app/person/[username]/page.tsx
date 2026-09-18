import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentActorId } from "@/auth/session";
import { ObjectGrid } from "@/components/ObjectGrid";
import { forumRepository } from "@/core/repository";

type PersonPageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: forumRepository.userByUsername(username)?.displayName ?? "Person" };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { username } = await params;
  const actorId = await currentActorId();
  const person = forumRepository.userByUsername(username);
  if (!person) notFound();
  const work = forumRepository.byCreator(person.id, actorId);
  const node = person.nodeId ? forumRepository.nodeById(person.nodeId) : undefined;

  return (
    <main className="object-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Network</Link><span>/</span><span>Person</span></nav>
      <header className="person-header">
        <p className="eyebrow">Body of work</p>
        <h1>{person.displayName}</h1>
        <p>{person.bio}</p>
        {node ? <Link className="byline" href={`/node/${node.slug}`}>{node.name}</Link> : null}
      </header>
      <ObjectGrid objects={work} />
    </main>
  );
}
