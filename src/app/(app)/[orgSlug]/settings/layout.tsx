import Link from "next/link";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const tabs = [
    { href: `/${orgSlug}/settings`, label: "General" },
    { href: `/${orgSlug}/settings/members`, label: "Members" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b px-6 pt-6">
        <h1 className="text-lg font-semibold mb-4">Settings</h1>
        <nav className="flex gap-1 -mb-px">
          {tabs.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground transition-colors data-[active=true]:border-primary data-[active=true]:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6 max-w-2xl">{children}</div>
    </div>
  );
}
