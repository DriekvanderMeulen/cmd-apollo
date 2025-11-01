import Link from "next/link";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-row">
      <div className="flex h-full w-1/2 px-16 bg-red-100 flex-col items-center justify-between ">
        <div className="flex h-16 w-full items-center px-6 gap-2 text-lg font-semibold text-neutral-900">
          <p>ApolloView</p>
          <strong>CMS</strong>
        </div>
        <div className="p-8 self-start">{children}</div>
        <div className="flex h-16 w-full items-left justify-start flex-col px-6 text-sm text-neutral-500">
          <Link
            href="/privacy-terms-conditions-cookies"
            className="hover:text-neutral-700 transition-colors"
          >
            Privacy, Algemene voorwaarden en Cookie beleid
          </Link>
          <Link
            target="_blank"
            href="https://www.driek.dev"
            className="hover:text-neutral-700 transition-colors"
          >
            Product door{" "}
            <strong className="font-semibold text-neutral-700">
              DRIEK.DEV in samenwerking met CMD Maastricht
            </strong>
          </Link>
        </div>
      </div>
      <div className="flex w-1/2 bg-red-950">
        <span className="text-5xl text-white self-center font-black">
          TODO IMAGE FIXEN!!!!
        </span>
      </div>
    </div>
  );
}

export default AuthLayout;
