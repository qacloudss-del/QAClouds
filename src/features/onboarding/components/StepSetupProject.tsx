"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  projectName: string;
  onComplete: (usedDemo: boolean) => void;
}

export function StepSetupProject({ projectName, onComplete }: Props) {
  const [selected, setSelected] = useState<"demo" | "blank" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    onComplete(selected === "demo");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Set up &ldquo;{projectName}&rdquo;</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Load sample data to see QAClouds in action, or start with a blank slate.
        </p>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setSelected("demo")}
          className={cn(
            "flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
            selected === "demo" && "border-primary bg-primary/5"
          )}
        >
          <div className="rounded-md bg-primary/10 p-2 mt-0.5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">Load demo data</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              25 sample test cases, a regression suite, sample defects, and execution history — so you see the full picture immediately.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelected("blank")}
          className={cn(
            "flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
            selected === "blank" && "border-primary bg-primary/5"
          )}
        >
          <div className="rounded-md bg-muted p-2 mt-0.5">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-sm">Start blank</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Empty project. Add your own test cases from scratch.
            </div>
          </div>
        </button>
      </div>

      <Button
        className="w-full"
        disabled={!selected || loading}
        onClick={handleContinue}
      >
        {loading ? "Setting up..." : "Continue →"}
      </Button>
    </div>
  );
}
