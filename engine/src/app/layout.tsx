import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import {
  currentForumSession,
  deploymentMode,
  previewIdentityEnabled,
} from "@/auth/session";
import { ForumHeader } from "@/components/ForumHeader";
import { forumRepository } from "@/core/repository";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Forum",
    template: "%s — Forum",
  },
  description: "A quiet network for active work.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Actor-scoped work must never be frozen into a shared prerendered page.
  await connection();
  const session = await currentForumSession();
  const actor = session ? forumRepository.userById(session.actorId) : undefined;
  const node = actor?.nodeId ? forumRepository.nodeById(actor.nodeId) : undefined;
  return (
    <html lang="en">
      <body>
        <ForumHeader
          actor={actor}
          nodeName={node?.name ?? "Forum"}
          mode={deploymentMode()}
          previewIdentityEnabled={previewIdentityEnabled()}
        />
        {children}
        <footer className="site-footer">
          <span>Forum Engine · foundation 0.1</span>
          <span>Complexity belongs in the work, not the interface.</span>
        </footer>
      </body>
    </html>
  );
}
