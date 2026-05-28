"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireAuth() {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return { userId, orgId: orgId ?? null };
}

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}
