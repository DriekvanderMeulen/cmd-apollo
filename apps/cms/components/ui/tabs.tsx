"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils";

export interface TabsProps {
  href: string;
  title: string;
}

function Tabs({ tabs, className }: { tabs: TabsProps[]; className?: string }) {
  return (
    <nav className={cn("mb-4", className)}>
      <ul className="flex space-x-6 border-b border-neutral-200 px-6">
        {tabs.map((tab) => (
          <Tab key={tab.title} href={tab.href} title={tab.title} />
        ))}
      </ul>
    </nav>
  );
}

interface tabProps {
  href: string;
  title: string;
}

function Tab({ href, title }: tabProps) {
  const pathname = usePathname();

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "relative block translate-y-px cursor-pointer border-b-2 pb-4 font-semibold transition-all duration-100",
          "before:absolute before:left-1/2 before:top-3 before:-z-10 before:h-10 before:w-[calc(100%+24px)] before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-[10px] before:transition-all hover:before:bg-neutral-200",
          pathname === href
            ? "border-base-black text-base-black"
            : "border-transparent text-neutral-500",
        )}
      >
        {title}
      </Link>
    </li>
  );
}

export default Tabs;
