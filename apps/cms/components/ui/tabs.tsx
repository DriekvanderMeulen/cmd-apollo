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
      <ul className="flex space-x-1 border-b border-neutral-200">
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
          "relative block translate-y-px cursor-pointer border-b-2 px-4 pb-3 text-sm font-medium transition-colors",
          pathname === href
            ? "border-accent text-accent"
            : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300",
        )}
      >
        {title}
      </Link>
    </li>
  );
}

export default Tabs;
