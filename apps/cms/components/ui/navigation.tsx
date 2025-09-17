"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiMiniArrowRightOnRectangle, HiUsers } from "react-icons/hi2";

import { logout } from "@/server/auth/actions";
import { cn } from "@/utils";

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
          "flex items-center space-x-3 rounded-ui px-3.5 py-2.5 text-sm font-medium transition-all duration-75",
          active
            ? "bg-neutral-200"
            : "text-neutral-600 hover:bg-neutral-200 hover:text-base-black",
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

  // Determine home path based on user role
  const homePath = user.role === "ADMIN" ? "/admin" : "/editor";

  return (
    <header className="flex h-full w-64 shrink-0 flex-col justify-between pb-4 pl-2.5 pt-2.5">
      <div>
        <button className="mb-2.5 flex w-full items-center justify-between rounded-ui p-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center">

            </div>
            <span className="font-semibold">Apolloview CMS</span>
          </div>
          {/* <HiChevronUpDown size={20} /> */}
        </button>

        <ul className="mb-6 space-y-px">
          <NavigationItem
            href={homePath}
            active={pathname === homePath}
            label="Home"
            icon={<HiHome size={18} />}
          />
          {user.role === "ADMIN" && (
            <NavigationItem
              href="/admin/users"
              active={pathname === "/admin/users"}
              label="User Management"
              icon={<HiUsers size={18} />}
            />
          )}
        </ul>
      </div>
      <div>
        <div className="mb-2.5">
          {/* @ts-ignore */}
          <form action={logout}>
            <button className="flex w-full items-center space-x-3 rounded-ui px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-75">
              <HiMiniArrowRightOnRectangle size={18} />
              <span>Logout</span>
            </button>
          </form>
        </div>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 items-center">
              {user.picture ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.picture}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 font-semibold capitalize text-white">
                  {user.givenName[0]}
                </div>
              )}
            </div>
            <div>
              <div className="-mb-[3px] font-semibold">
                {user.givenName} {user.familyName}
              </div>
              <div className="text-[12px] font-medium text-neutral-500">
                {user.email}
              </div>
            </div>
          </div>
          {/* <button className="rounded-full p-1.5 hover:bg-neutral-200">
            <HiMiniEllipsisVertical size={20} />
          </button> */}
        </div>
      </div>
    </header>
  );
}

export default Navigation;
