import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

import { Navigation } from "@/components/ui";
import { validateRequest } from "@/server/auth/validate";

interface AppLayoutProps {
  children: React.ReactNode;
}

async function AppLayout({ children }: AppLayoutProps) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
			<div className="relative flex min-h-screen bg-[rgb(var(--surface))] text-[rgb(var(--color-neutral-900))]">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(var(--color-primary),0.08),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(var(--color-accent),0.08),transparent_32%)]" />
				<Navigation user={user} />
				<div className="relative z-10 flex min-h-screen flex-1 flex-col overflow-hidden">
					<div className="h-full grow overflow-y-auto px-4 pb-10 pt-8 sm:px-6 lg:px-10">
						<main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
							{children}
						</main>
					</div>
				</div>
			</div>
      <Toaster
        toastOptions={{
          className: "!shadow-none font-medium",
        }}
        position="bottom-right"
      />
    </>
  );
}

export default AppLayout;
