import Link from "next/link";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-row overflow-hidden bg-white">
      <div className="flex h-full w-full lg:w-1/2 px-2 flex-col items-center justify-between relative z-10">
        <div className="flex h-24 w-full items-center gap-2 text-xl font-bold text-neutral-900">
          <div className="h-8 w-8 bg-neutral-900 rounded-lg" />
          <span>ApolloView CMS</span>
        </div>
        <div className="w-full max-w-[440px]">{children}</div>
        <div className="flex h-24 w-full flex-col justify-center gap-1 text-xs text-neutral-500 font-medium">
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
      <div
        className="hidden lg:flex w-1/2 relative bg-neutral-100"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-image.jpg')" }} 
        />
        <div className="absolute inset-0 bg-neutral-900/10" />
      </div>
    </div>  
  );
}

export default AuthLayout;
