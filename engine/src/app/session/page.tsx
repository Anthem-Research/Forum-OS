import { notFound } from "next/navigation";
import { choosePreviewIdentity, clearPreviewIdentity } from "./actions";
import { currentActorId, previewIdentityEnabled } from "@/auth/session";
import { forumRepository } from "@/core/repository";

export const metadata = { title: "Preview identity" };

export default async function PreviewIdentityPage() {
  if (!previewIdentityEnabled()) notFound();

  const activeActorId = await currentActorId();
  const users = forumRepository.users();

  return (
    <main className="object-page session-page">
      <header className="session-header">
        <p className="eyebrow">Development preview</p>
        <h1>Choose a working identity.</h1>
        <p>
          This request-scoped identity exists only for local development. It lets the privacy
          boundary be tested without presenting seed data as production authentication.
        </p>
      </header>

      <section className="identity-list" aria-label="Preview identities">
        {users.map((user) => {
          const isActive = user.id === activeActorId;
          return (
            <article className="identity-option" key={user.id}>
              <div>
                <p className="eyebrow">{user.accountType}</p>
                <h2>{user.displayName}</h2>
                <p>{user.bio}</p>
              </div>
              <form action={choosePreviewIdentity}>
                <input name="actorId" type="hidden" value={user.id} />
                <button disabled={isActive} type="submit">
                  {isActive ? "Current identity" : `Work as ${user.displayName}`}
                </button>
              </form>
            </article>
          );
        })}
      </section>

      {activeActorId ? (
        <form action={clearPreviewIdentity} className="clear-identity">
          <button type="submit">Return to public view</button>
        </form>
      ) : null}
    </main>
  );
}
