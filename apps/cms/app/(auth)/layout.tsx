import Link from "next/link";
import type { PropsWithChildren } from "react";

function AuthLayout({ children }: PropsWithChildren<{}>) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <div className="flex h-16 w-full items-center px-6 text-xl font-bold">
        ApolloView CMS
      </div>
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-10">
        {children}
      </div>
      <div className="flex h-16 w-full items-center justify-between px-6 text-sm text-gray-600">
        <Link href="/privacy">Privacy</Link>
        <Link target="_blank" href="https://apolloview.app">
          Product by <strong>DRIEK.DEV in collaboration with CMD Maastricht</strong>
        </Link>
      </div>
    </div>
  );
}

export default AuthLayout;
