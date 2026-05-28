"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepCreateOrg } from "./StepCreateOrg";
import { StepCreateProject } from "./StepCreateProject";
import { StepSetupProject } from "./StepSetupProject";
import { StepSkippable } from "./StepSkippable";
import { cn } from "@/lib/utils";

const STEPS = [
  "Create organization",
  "Create project",
  "Set up project",
  "Invite teammates",
  "First test case",
  "First execution",
];

interface Props {
  initialStep: number;
  initialOrgId?: string;
  initialProjectName?: string;
}

export function OnboardingWizard({
  initialStep,
  initialOrgId,
  initialProjectName,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [orgId, setOrgId] = useState(initialOrgId ?? "");
  const [projectName, setProjectName] = useState(initialProjectName ?? "");

  function handleOrgCreated(id: string) {
    setOrgId(id);
    setStep(2);
  }

  function handleProjectCreated(_id: string, name: string) {
    setProjectName(name);
    setStep(3);
  }

  function handleSetupComplete() {
    setStep(4);
  }

  function handleComplete() {
    router.push(`/dashboard`);
  }

  const completedPercent = Math.round((step / STEPS.length) * 100);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="font-semibold tracking-tight text-lg">QAClouds</span>
        <p className="text-xs text-muted-foreground mt-1">
          Step {Math.min(step + 1, STEPS.length)} of {STEPS.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 rounded-full flex-1 mx-0.5 transition-colors duration-300",
                i < step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={cn(
                "text-[10px] flex-1 text-center leading-tight hidden sm:block",
                i < step
                  ? "text-primary font-medium"
                  : i === step
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {step === 0 && (
          <StepCreateOrg onComplete={(id) => handleOrgCreated(id)} />
        )}
        {step === 1 && (
          <StepCreateProject orgId={orgId} onComplete={handleProjectCreated} />
        )}
        {step === 2 && (
          <StepSetupProject
            projectName={projectName}
            onComplete={handleSetupComplete}
          />
        )}
        {step === 3 && (
          <StepSkippable
            title="Invite your teammates"
            description="Add your QA team to collaborate on test cases and executions."
            ctaLabel="Continue →"
            onContinue={() => setStep(4)}
            onSkip={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <StepSkippable
            title="Create your first test case"
            description="Define a test case with steps and expected outcomes."
            ctaLabel="Continue →"
            onContinue={() => setStep(5)}
            onSkip={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <StepSkippable
            title="Run your first execution"
            description="Execute test cases and start tracking quality signals."
            ctaLabel="Go to dashboard →"
            skipLabel="Skip to dashboard"
            onContinue={handleComplete}
            onSkip={handleComplete}
          />
        )}
      </div>

      {/* Progress label */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        {completedPercent}% complete
      </p>
    </div>
  );
}
