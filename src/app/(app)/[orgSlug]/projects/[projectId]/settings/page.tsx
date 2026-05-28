import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProjectSettingsForm } from "@/features/projects/components/ProjectSettingsForm";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = await params;
  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || !org) notFound();

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="font-medium">General</h2>
        <p className="text-sm text-muted-foreground">Update project name, description, and color.</p>
      </div>
      <Separator />
      <ProjectSettingsForm
        projectId={projectId}
        orgId={org.id}
        defaultValues={{ name: project.name, description: project.description ?? "", color: project.color }}
      />

      <Separator />
      <div>
        <h3 className="font-medium text-sm mb-1">More settings</h3>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href={`/${orgSlug}/projects/${projectId}/settings/members`}>Members →</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="w-fit">
            <Link href={`/${orgSlug}/projects/${projectId}/settings/environments`}>Environments →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
