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
      <div className="relative z-10 flex h-full overflow-hidden bg-white">
        <Navigation user={user} />
        <div className="min-h-full grow overflow-y-scroll pb-8">
          <main className="wrapper pt-12 flex min-h-full flex-col">
            {children}
          </main>
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
