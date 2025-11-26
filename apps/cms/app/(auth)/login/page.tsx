import { redirect } from "next/navigation";

import { SignInWithGoogle } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { validateRequest } from "@/server/auth/validate";

async function LoginPage() {
  const { session } = await validateRequest();

  if (session) {
    return redirect("/");
  }

  return (
    <Card className="w-full shadow-none border-none bg-transparent p-0">
      <CardHeader className="space-y-3 text-center px-0 pt-0 pb-8">
        <CardTitle className="text-3xl font-bold tracking-tight text-neutral-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-base text-neutral-600">
          Sign in to Apolloview CMS to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0 pb-0">
        <SignInWithGoogle />
        <p className="text-center text-xs text-neutral-400 leading-relaxed px-4">
          By continuing, you agree to our Terms of Service, Privacy Policy, and Cookie Policy.
        </p>
      </CardContent>
    </Card>
  );
}

export default LoginPage;
