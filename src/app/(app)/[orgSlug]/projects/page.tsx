import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getProjectsForOrg } from "@/features/projects/actions/project-actions";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { CreateProjectModal } from "@/features/projects/components/CreateProjectModal";
import { checkPermission } from "@/lib/rbac";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const projects = await getProjectsForOrg(org.id);
  const { allowed: canManage } = await checkPermission(user.id, org.id, "can_manage_projects");

  const active = projects.filter((p) => p.status === "ACTIVE");
  const archived = projects.filter((p) => p.status === "ARCHIVED");

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">{active.length} active project{active.length !== 1 ? "s" : ""}</p>
        </div>
        {canManage && <CreateProjectModal orgId={org.id} orgSlug={orgSlug} />}
      </div>

      {active.length === 0 && archived.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">No projects yet.</p>
          {canManage && <CreateProjectModal orgId={org.id} orgSlug={orgSlug} />}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                orgId={org.id}
                orgSlug={orgSlug}
                canManage={canManage}
              />
            ))}
          </div>

          {archived.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Archived</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archived.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    orgId={org.id}
                    orgSlug={orgSlug}
                    canManage={canManage}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
