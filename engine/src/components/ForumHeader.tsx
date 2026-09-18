import Link from "next/link";

export function ForumHeader({
  actor,
  nodeName,
  mode,
  previewIdentityEnabled,
}: {
  actor?: { displayName: string; username: string };
  nodeName: string;
  mode: "local" | "connected";
  previewIdentityEnabled: boolean;
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
        {actor ? <Link href={`/person/${actor.username}`}>{actor.displayName}</Link> : null}
      </nav>
      <div className="connection-state" title={mode === "local" ? "No external services enabled" : "Forum Network enabled"}>
        {previewIdentityEnabled ? (
          <Link href="/session">{actor ? `Preview · ${actor.displayName}` : "Choose preview"}</Link>
        ) : mode === "local" ? (
          "Local node"
        ) : (
          "Connected"
        )}
      </div>
    </header>
  );
}
