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
    <ul className="flex space-x-2 pt-8 text-sm font-medium">
      {breadcrumbs.map((b, i) => (
        <li key={`breadcrumb-${i}`}>
          {b.href ? (
            <Link
              href={b.href || "/"}
              className={cn(
                "flex items-center",
                i < breadcrumbs.length - 1 ? "text-neutral-500" : "font-bold",
              )}
            >
              <span>{b.label}</span>
              {i < breadcrumbs.length - 1 && (
                <HiMiniChevronRight size={18} className="ml-2" />
              )}
            </Link>
          ) : (
            <div
              className={cn(
                "flex items-center",
                i < breadcrumbs.length - 1 ? "text-neutral-500" : "font-bold",
              )}
            >
              <span>{b.label}</span>
              {i < breadcrumbs.length - 1 && (
                <HiMiniChevronRight size={18} className="ml-2" />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default BreadCrumbs;
