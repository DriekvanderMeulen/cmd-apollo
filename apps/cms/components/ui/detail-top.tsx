import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi";

import { cn } from "@/utils";

interface DetailTopProps {
  title: string;
  backHref?: string;
  children?: React.ReactNode;
}

function DetailTop({ backHref, title, children }: DetailTopProps) {
  return (
    <div className={cn("flex items-center justify-between py-8")}>
      <h1 className="h-11 text-3xl font-bold leading-10">
        {backHref ? (
          <Link href={backHref} className="-ml-2.5 flex items-center space-x-1">
            <HiChevronLeft size={32} />
            <span>{title}</span>
          </Link>
        ) : (
          title
        )}
      </h1>
      <div>{children}</div>
    </div>
  );
}

export default DetailTop;
