import Link from "next/link";

export function ForumHeader({
  nodeName,
  mode,
}: {
  nodeName: string;
  mode: "local" | "connected";
}) {
  return (
    <header className="forum-header">
      <div className="forum-identity">
        <Link className="forum-mark" href="/">
          FORUM
        </Link>
        <span className="node-context">{nodeName}</span>
      </div>
      <form className="header-search" action="/search" role="search">
        <label className="sr-only" htmlFor="forum-search">
          Search Forum
        </label>
        <input id="forum-search" name="q" placeholder="Search" type="search" />
      </form>
      <nav aria-label="Primary navigation">
        <Link href="/">Network</Link>
        <Link href="/library">Library</Link>
        <Link href="/person/atlas">Atlas</Link>
      </nav>
      <p className="connection-state" title={mode === "local" ? "No external services enabled" : "Forum Network enabled"}>
        {mode === "local" ? "Local node" : "Connected"}
      </p>
    </header>
  );
}
