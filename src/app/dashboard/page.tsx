import { UserButton } from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">QAClouds</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">You&apos;re in!</h1>
        <p className="text-muted-foreground max-w-sm">
          Onboarding complete. The full dashboard is being built — check back
          soon as we ship Epic 3 and beyond.
        </p>
      </main>
    </div>
  );
}
