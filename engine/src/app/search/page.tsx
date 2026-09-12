import { ObjectIndex } from "@/components/ObjectIndex";
import { currentActorId, forumRepository } from "@/core/repository";

type SearchPageProps = { searchParams: Promise<{ q?: string | string[] }> };

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] ?? "" : q ?? "";
  const results = forumRepository.search(query, currentActorId());
  return (
    <main className="object-page search-page">
      <form className="search-form" action="/search" role="search">
        <label htmlFor="search-page-input">Search Forum</label>
        <div><input id="search-page-input" name="q" type="search" defaultValue={query} autoFocus /><button type="submit">Search</button></div>
      </form>
      <section aria-live="polite">
        <header className="section-header">
          <h1>{query ? `Results for “${query}”` : "Builds, Blocks and Collections"}</h1>
          <span>{query ? `${results.length} objects` : "Enter a word or phrase"}</span>
        </header>
        <ObjectIndex objects={results} />
      </section>
    </main>
  );
}
