import Link from "next/link";
import { HiMiniChevronRight } from "react-icons/hi2";

import { cn } from "@/utils";

interface BreadCrumbsProps {
  breadcrumbs: {
    label: string;
    href?: string;
  }[];
}

function BreadCrumbs({ breadcrumbs }: BreadCrumbsProps) {
  return (
    <ul className="flex space-x-1.5 pt-6 text-sm">
      {breadcrumbs.map((b, i) => (
        <li key={`breadcrumb-${i}`}>
          {b.href ? (
            <Link
              href={b.href || "/"}
              className={cn(
                "flex items-center transition-colors",
                i < breadcrumbs.length - 1
                  ? "text-neutral-500 hover:text-neutral-700"
                  : "font-semibold text-neutral-800",
              )}
            >
              <span>{b.label}</span>
              {i < breadcrumbs.length - 1 && (
                <HiMiniChevronRight
                  size={16}
                  className="ml-1.5 text-neutral-400"
                />
              )}
            </Link>
          ) : (
            <div
              className={cn(
                "flex items-center",
                i < breadcrumbs.length - 1
                  ? "text-neutral-500"
                  : "font-semibold text-neutral-800",
              )}
            >
              <span>{b.label}</span>
              {i < breadcrumbs.length - 1 && (
                <HiMiniChevronRight
                  size={16}
                  className="ml-1.5 text-neutral-400"
                />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default BreadCrumbs;
