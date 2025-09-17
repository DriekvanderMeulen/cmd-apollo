"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { verifyLoginToken } from "@/actions/mutations/auth";
import {
  VerifyLoginTokenSchemaType,
  verifyLoginTokenSchema,
} from "@/actions/schemas/auth";
import { Input } from "@/components/form";
import { Button } from "@/components/ui";

interface SignInWithEmailVerifyProps {
  email: string;
}

function SignInWithEmailVerify({ email }: SignInWithEmailVerifyProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<VerifyLoginTokenSchemaType>({
    resolver: zodResolver(verifyLoginTokenSchema),
    defaultValues: {
      email,
      token: "",
    },
  });
  const onSubmit = handleSubmit(async (data) => {
    const result = await verifyLoginToken(data);

    if (result.status === "success") {
      router.refresh();
    }

    if (result.error) {
      setErrorMessage(result.error.message);
    }
  });

  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <Input
        label="Code"
        name="token"
        placeholder="Enter code manually"
        control={control}
      />
      <Button
        isLoading={isSubmitting}
        type="submit"
        className="w-full"
        title="Sign in"
      />
      {errorMessage && (
        <div className="text-center text-sm text-red-500">{errorMessage}</div>
      )}
    </form>
  );
}

export default SignInWithEmailVerify;
