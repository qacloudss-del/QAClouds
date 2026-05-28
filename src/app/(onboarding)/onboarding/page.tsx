import { redirect } from "next/navigation";
import { getUserOnboardingState } from "@/features/onboarding/actions/onboarding-actions";
import { OnboardingWizard } from "@/features/onboarding/components/OnboardingWizard";

export default async function OnboardingPage() {
  const state = await getUserOnboardingState();

  if (!state) redirect("/sign-in");

  // Derive which step to resume from
  let initialStep = 0;
  if (state.organization) initialStep = 1;
  if (state.organization && state.project) initialStep = 2;

  return (
    <OnboardingWizard
      initialStep={initialStep}
      initialOrgId={state.organization?.id}
      initialOrgSlug={state.organization?.slug}
      initialProjectName={state.project?.name}
    />
  );
}
