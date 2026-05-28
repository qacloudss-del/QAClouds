import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { OrgSettingsForm } from "@/features/organizations/components/OrgSettingsForm";
import { Separator } from "@/components/ui/separator";

export default async function OrgGeneralSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-medium">General</h2>
        <p className="text-sm text-muted-foreground">
          Update your organization name and preferences.
        </p>
      </div>
      <Separator />
      <OrgSettingsForm
        orgId={org.id}
        defaultValues={{ name: org.name, timezone: org.timezone }}
      />
    </div>
  );
}
