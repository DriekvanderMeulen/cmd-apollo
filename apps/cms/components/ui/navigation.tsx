"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogOut, Users, UserRoundCog } from "lucide-react";

import { logout } from "@/server/auth/actions";
import { cn } from "@/utils";
// replaced react-icons with lucide-react for a cleaner, lightweight set

interface NavigationProps {
  user: {
    givenName: string;
    familyName: string;
    email: string;
    picture: string | null;
    role: "ADMIN" | "EDITOR" | "USER";
  };
}

interface NavigationItemProps {
  href: string;
  active: boolean;
  label: string;
  icon: React.ReactNode;
}

function NavigationItem({ href, active, label, icon }: NavigationItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center space-x-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
          active
            ? "bg-neutral-200/70 text-neutral-900"
            : "text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-800",
        )}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
}

function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-full w-64 shrink-0 flex-col justify-between bg-surface-sidebar border-r border-neutral-200 pb-5 px-3 pt-3">
      <div>
        <div className="mb-4 flex w-full items-center justify-between px-2 py-2">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center"></div>
            <span className="font-semibold text-neutral-800">
              Apolloview CMS
            </span>
          </div>
        </div>

        <ul className="mb-6 space-y-1">
          <NavigationItem
            href="/"
            active={pathname === "/"}
            label="Home"
            icon={<Home size={18} />}
          />
          {user.role === "ADMIN" && (
            <NavigationItem
              href="/admin"
              active={pathname === "/admin"}
              label="Admin"
              icon={<UserRoundCog size={18} />}
            />
          )}
          {(user.role === "ADMIN" || user.role === "EDITOR") && (
            <NavigationItem
              href="/editor"
              active={pathname === "/editor"}
              label="Editor"
              icon={<Users size={18} />}
            />
          )}
        </ul>
      </div>
      <div>
        <div className="mb-3">
          {/* @ts-expect-error */}
          <form action={logout}>
            <button className="flex w-full items-center space-x-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50/80 transition-colors">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </form>
        </div>
        <div className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-neutral-100/50 transition-colors">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center">
              {user.picture ? (
                <img
                  className="h-7 w-7 rounded-full"
                  src={user.picture}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-semibold capitalize">
                  {user.givenName[0]}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-neutral-800 truncate">
                {user.givenName} {user.familyName}
              </div>
              <div className="text-xs text-neutral-500 truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
