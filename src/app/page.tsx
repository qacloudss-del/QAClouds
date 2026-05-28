import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">QAClouds</span>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Get started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center space-y-3 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Modern QA Operations Platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage test cases, run executions, track defects, and monitor
            release quality — all in one place.
          </p>
        </div>
        <SignedOut>
          <SignUpButton>
            <Button size="lg">Start for free</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button size="lg" asChild>
            <a href="/onboarding">Go to dashboard →</a>
          </Button>
        </SignedIn>
      </main>
    </div>
  );
}
