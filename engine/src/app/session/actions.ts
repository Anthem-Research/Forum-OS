"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PREVIEW_ACTOR_COOKIE } from "@/auth/session";
import { developmentPreviewEnabled, resolvePreviewActorId } from "@/auth/session-policy";
import { forumRepository } from "@/core/repository";

export async function choosePreviewIdentity(formData: FormData) {
  const requestedActorId = formData.get("actorId");
  const actorId = resolvePreviewActorId(
    typeof requestedActorId === "string" ? requestedActorId : null,
    forumRepository.users(),
  );

  if (!actorId) throw new Error("Development preview identities are unavailable.");

  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_ACTOR_COOKIE, actorId, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
}

export async function clearPreviewIdentity() {
  if (!developmentPreviewEnabled()) {
    throw new Error("Development preview identities are unavailable.");
  }

  (await cookies()).delete(PREVIEW_ACTOR_COOKIE);
  redirect("/session");
}
