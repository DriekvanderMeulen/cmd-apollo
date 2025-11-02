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
        <h1 className="mb-2 text-3xl font-semibold text-neutral-900">
          Inloggen
        </h1>
        <p className="text-neutral-600 text-[15px]">
          Welkom! Log in om verder te gaan.
        </p>
      </div>
      <SignInWithGoogle />
      <p className="text-xs text-black/70">Door gebruik te maken van Apolloview ga je akkoord met onze Algemene voorwwarden, Privacy beleid en Cookie beleid.</p>
    </div>
  );
}

export default LoginPage;
