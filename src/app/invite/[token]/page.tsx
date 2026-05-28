import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { acceptInvite } from "@/features/organizations/actions/org-actions";
import { Button } from "@/components/ui/button";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-up?redirect=/invite/${token}`);
  }

  const result = await acceptInvite(token);

  if (result.success) {
    redirect(`/${result.orgSlug}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-xl font-semibold">Invitation unavailable</h1>
        <p className="text-sm text-muted-foreground">{result.error}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
