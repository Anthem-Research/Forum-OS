import Link from "next/link";
import { ObjectGrid } from "@/components/ObjectGrid";
import { currentActorId, forumRepository } from "@/core/repository";

export default function HomePage() {
  const actorId = currentActorId();
  const actor = forumRepository.userById(actorId);
  const ownWork = forumRepository
    .accessibleObjects(actorId)
    .filter((object) => object.creatorId === actorId)
    .slice(0, 4);
  const selected = forumRepository.selected(actorId).slice(0, 4);
  const network = forumRepository
    .builds(actorId)
    .filter((build) => build.visibility === "network")
    .slice(0, 4);

  return (
    <main>
      <section className="opening-index" aria-labelledby="opening-title">
        <p className="section-number">01 / WORK IN MOTION</p>
        <h1 id="opening-title">
          Things being made,
          <br /> tested and changed.
        </h1>
        <p className="opening-note">
          {actor?.displayName}&apos;s private work and the parts of Forum Plett currently visible to this household.
        </p>
      </section>

      <section className="content-section" aria-labelledby="your-work-title">
        <header className="section-header">
          <h2 id="your-work-title">Recent from your work</h2>
          <Link href="/person/atlas">Open body of work</Link>
        </header>
        <ObjectGrid objects={ownWork} />
      </section>

      <section className="content-section" aria-labelledby="selected-title">
        <header className="section-header">
          <h2 id="selected-title">Forum Selected</h2>
          <Link href="/library">Enter Library</Link>
        </header>
        <ObjectGrid objects={selected} />
      </section>

      <section className="content-section final-section" aria-labelledby="network-title">
        <header className="section-header">
          <h2 id="network-title">Across the Network</h2>
          <span>Recently changed</span>
        </header>
        <ObjectGrid objects={network} />
      </section>
    </main>
  );
}
