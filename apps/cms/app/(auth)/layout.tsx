import Link from "next/link";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[rgb(var(--surface))] text-[rgb(var(--color-neutral-900))]">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(var(--color-primary),0.12),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(var(--color-accent),0.14),transparent_30%)]" />
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[520px] rounded-2xl bg-[rgb(var(--surface-muted))] p-8 shadow-md ring-1 ring-[rgba(var(--border),0.8)] backdrop-blur sm:p-10">
          <div className="flex items-center gap-2 text-xl font-semibold text-[rgb(var(--color-neutral-900))]">
            <div className="leading-tight">
              <div className="text-sm font-medium text-[rgb(var(--color-neutral-500))]">
                ApolloView
              </div>
              <div className="text-base font-semibold">Studentenportaal</div>
            </div>
          </div>
          <div className="mt-8">{children}</div>
          <div className="mt-10 flex flex-col gap-2 text-xs font-medium text-[rgb(var(--color-neutral-500))]">
            <Link
              href="/privacy-terms-conditions-cookies"
              className="transition-colors hover:text-[rgb(var(--color-neutral-700))]"
            >
              Privacy, Algemene voorwaarden en Cookie beleid
            </Link>
            <Link
              target="_blank"
              href="https://www.driek.dev"
              className="transition-colors hover:text-[rgb(var(--color-neutral-700))]"
            >
              Product door{" "}
              <strong className="font-semibold text-[rgb(var(--color-neutral-800))]">
                DRIEK.DEV in samenwerking met CMD Maastricht
              </strong>
            </Link>
          </div>
        </div>
      </div>
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(var(--color-accent))] to-[rgba(var(--color-primary),0.25)] opacity-80" />
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('/bg-image.jpg')" }} />
      </div>
    </div>
  );
}

export default AuthLayout;
