import { redirect } from "next/navigation";

import { validateRequest } from "@/server/auth";
import { ObjectsTable } from "@/components/objects/objects-table";

async function Home() {
  const { session } = await validateRequest();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your objects</h1>
        <p className="text-neutral-600 mt-1">Create and manage your objects.</p>
      </div>
      <ObjectsTable />
    </div>
  );
}

export default Home;
