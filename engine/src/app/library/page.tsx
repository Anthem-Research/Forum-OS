import { ObjectGrid } from "@/components/ObjectGrid";
import { currentActorId, forumRepository } from "@/core/repository";

export const metadata = { title: "Library" };

export default function LibraryPage() {
  const selected = forumRepository.selected(currentActorId());
  return (
    <main className="object-page">
      <header className="library-header">
        <p className="eyebrow">Forum Library</p>
        <h1>Selected work</h1>
        <p>Work chosen for its usefulness, clarity, technical interest or capacity to generate further work.</p>
      </header>
      <ObjectGrid objects={selected} />
    </main>
  );
}
