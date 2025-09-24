import { redirect } from "next/navigation";

import { SignInWithGoogle } from "@/components/auth";
import { env } from "@/env";
import { validateRequest } from "@/server/auth/validate";

async function LoginPage() {
  const { session } = await validateRequest();

  if (session) {
    return redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-3xl font-bold">Sign in</h1>
        <p className="text-gray-600">Welcome! Please sign in to continue</p>
      </div>
      <SignInWithGoogle />
    </div>
  );
}

export default LoginPage;
