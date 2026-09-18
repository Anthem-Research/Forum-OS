"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface SearchItem {
  id: string;
  kind: string;
  title: string;
  description: string;
  href: string;
}

export function SearchSurface({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return [];
    return items.filter((item) =>
      [item.title, item.description, item.kind].some((value) =>
        value.toLocaleLowerCase().includes(needle),
      ),
    );
  }, [items, query]);

  return (
    <main className="object-page search-page">
      <div className="search-form" role="search">
        <label htmlFor="search-page-input">Search public Forum records</label>
        <div>
          <input
            autoFocus
            id="search-page-input"
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            value={query}
          />
        </div>
      </div>
      <section aria-live="polite">
        <header className="section-header">
          <h1>{query ? `Results for “${query}”` : "Public records"}</h1>
          <span>{query ? `${results.length} objects` : "Enter a word or phrase"}</span>
        </header>
        <ol className="object-index">
          {results.map((item) => (
            <li key={item.id}>
              <Link href={item.href}>
                <span className="index-type">{item.kind}</span>
                <span className="index-title">{item.title}</span>
                <span className="index-maker">{item.description}</span>
                <span className="index-status">public</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
