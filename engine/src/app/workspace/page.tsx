import Link from "next/link";
import { currentActorId, previewIdentityEnabled } from "@/auth/session";
import { PrivateWorkspace } from "@/components/PrivateWorkspace";
import { forumRepository } from "@/core/repository";

export const metadata = { title: "Private workspace" };

export default async function WorkspacePage() {
  const actorId = await currentActorId();
  const actor = actorId ? forumRepository.userById(actorId) : undefined;

  if (!actor) {
    return (
      <main className="message-page">
        <p className="eyebrow">Private workspace</p>
        <h1>Choose an identity before opening private work.</h1>
        {previewIdentityEnabled() ? <Link href="/session">Choose preview identity</Link> : <Link href="/">Return to Forum</Link>}
      </main>
    );
  }

  return <PrivateWorkspace ownerId={actor.id} ownerName={actor.displayName} />;
}
