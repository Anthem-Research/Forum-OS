import Link from "next/link";

export function ForumHeader() {
  return (
    <header className="forum-header">
      <div className="forum-identity">
        <Link className="forum-mark" href="/">
          FORUM
        </Link>
        <span className="node-context">Forum Plett</span>
      </div>
      <div className="header-search" aria-hidden="true" />
      <nav aria-label="Primary navigation">
        <Link href="/workspace">Workspace</Link>
        <Link href="/">Network</Link>
        <Link href="/library">Library</Link>
        <Link href="/search">Search</Link>
      </nav>
      <div className="connection-state" title="Private workspace data stays in this browser">
        Device-local
      </div>
    </header>
  );
}
