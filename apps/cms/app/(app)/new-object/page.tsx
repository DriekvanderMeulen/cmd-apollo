import { redirect } from "next/navigation";

import { validateRequest } from "@/server/auth";
import { NewObjectForm } from "@/components/objects/new-object-form";

export default async function Page() {
  const { session } = await validateRequest();
  if (!session) redirect("/login");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">New object</h1>
        <p className="text-neutral-600 mt-1.5 text-[15px]">
          Create an object and optionally upload a file.
        </p>
      </div>
      <NewObjectForm />
    </div>
  );
}
