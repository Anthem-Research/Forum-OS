import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentActorId } from "@/auth/session";
import { ObjectGrid } from "@/components/ObjectGrid";
import { forumRepository } from "@/core/repository";

type NodePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: NodePageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: forumRepository.nodeBySlug(slug)?.name ?? "Node" };
}

export default async function NodePage({ params }: NodePageProps) {
  const { slug } = await params;
  const node = forumRepository.nodeBySlug(slug);
  if (!node) notFound();
  const work = forumRepository.byNode(node.id, await currentActorId());

  return (
    <main className="object-page node-page">
      <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Network</Link><span>/</span><span>Node</span></nav>
      <header className="node-header">
        <div><p className="eyebrow">Physical Node</p><h1>{node.name}</h1></div>
        <div><p>{node.description}</p><p className="byline">{node.locationLabel}</p></div>
      </header>
      <ObjectGrid objects={work} />
    </main>
  );
}
