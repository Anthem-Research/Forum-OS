import Link from "next/link";
import { ObjectGrid } from "@/components/ObjectGrid";
import { forumRepository } from "@/core/repository";

export default function HomePage() {
  const publicWork = forumRepository.accessibleObjects(null).slice(0, 4);
  const selected = forumRepository.selected(null).slice(0, 4);
  const network = forumRepository
    .builds(null)
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
          Forum begins with physical work in Plett. Only deliberately public records appear here;
          working material remains in the private workspace on your device.
        </p>
        <Link className="opening-action" href="/workspace">Open private workspace</Link>
      </section>

      <section className="content-section" aria-labelledby="your-work-title">
        <header className="section-header">
          <h2 id="your-work-title">Public work</h2>
          <span>Nothing is published by default</span>
        </header>
        <ObjectGrid objects={publicWork} />
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
