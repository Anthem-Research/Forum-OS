import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectGrid } from "@/components/ObjectGrid";
import { currentActorId, forumRepository } from "@/core/repository";

type BuildPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BuildPageProps): Promise<Metadata> {
  const { slug } = await params;
  const build = forumRepository.buildBySlug(slug, currentActorId());
  return { title: build?.title ?? "Build" };
}

export default async function BuildPage({ params }: BuildPageProps) {
  const { slug } = await params;
  const actorId = currentActorId();
  const build = forumRepository.buildBySlug(slug, actorId);
  if (!build) notFound();

  const contents = forumRepository.contents(build, actorId);
  const contributors = forumRepository.contributors(build);
  const node = build.nodeId ? forumRepository.nodeById(build.nodeId) : undefined;
  const revisions = forumRepository.revisionsFor(build);

  return (
    <main className="object-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Network</Link>
        <span>/</span>
        <span>Build</span>
      </nav>
      <header className="build-header">
        <div>
          <p className="eyebrow">
            {build.state} · {build.visibility}
            {build.curationStatus !== "none" ? ` · Forum ${build.curationStatus}` : ""}
          </p>
          <h1>{build.title}</h1>
        </div>
        <div className="build-description">
          <p>{build.description}</p>
          <dl>
            <div>
              <dt>Made by</dt>
              <dd>
                {contributors.map((contributor, index) => (
                  <span key={contributor.id}>
                    {index > 0 ? " + " : ""}
                    <Link href={`/person/${contributor.username}`}>{contributor.displayName}</Link>
                  </span>
                ))}
              </dd>
            </div>
            {node ? (
              <div>
                <dt>Node</dt>
                <dd><Link href={`/node/${node.slug}`}>{node.name}</Link></dd>
              </div>
            ) : null}
            <div>
              <dt>Changed</dt>
              <dd>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(build.updatedAt))}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="build-work" aria-label={`${build.title} objects`}>
        <ObjectGrid objects={contents} />
      </section>

      <aside className="build-record" aria-labelledby="record-title">
        <h2 id="record-title">Record</h2>
        <p>{contents.length} connected objects · {revisions.length} saved versions</p>
        {revisions.map((revision) => (
          <div className="revision" key={revision.id}>
            <span>Version {revision.revisionNumber}</span>
            <span>{revision.message}</span>
          </div>
        ))}
      </aside>
    </main>
  );
}
