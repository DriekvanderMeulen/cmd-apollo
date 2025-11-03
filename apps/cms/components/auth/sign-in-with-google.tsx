"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui";
import { signInWithGoogle } from "@/server/auth/actions";

function SignInWithGoogle() {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      // TODO: Handle error
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={signIn}
      iconLeft={<FcGoogle size={20} />}
      title="Sign in with Google"
      isLoading={isLoading}
      variant="secondary"
      className="w-full rounded-sm bg-red-100 border-black hover:bg-red-200 hover:border-red-500 cursor-pointer"
    />
  );
}

export default SignInWithGoogle;
