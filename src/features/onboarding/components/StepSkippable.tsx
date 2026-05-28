"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Props {
  title: string;
  description: string;
  ctaLabel: string;
  skipLabel?: string;
  onContinue: () => void;
  onSkip: () => void;
}

export function StepSkippable({
  title,
  description,
  ctaLabel,
  skipLabel = "Skip for now",
  onContinue,
  onSkip,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border bg-muted p-2">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        This feature is coming in the next update.
        <br />
        Skip for now — you can do this from the dashboard.
      </div>

      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={onContinue}>
          {ctaLabel}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onSkip}>
          {skipLabel}
        </Button>
      </div>
    </div>
  );
}
