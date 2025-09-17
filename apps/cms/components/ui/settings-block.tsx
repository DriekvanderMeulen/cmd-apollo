"use client";

import type { PropsWithChildren } from "react";

import { cn } from "@/utils";

interface SettingsBlock extends PropsWithChildren {
  title: string;
  description?: string;
  direction?: "row" | "column";
}

function SettingsBlock({
  title,
  description,
  children,
  direction = "column",
}: SettingsBlock) {
  return (
    <div className="grid grid-cols-2 gap-x-8 rounded-2xl bg-white p-6">
      <h3 className="col-span-2 pb-0.5 text-xl font-bold">{title}</h3>
      <div
        className={cn(
          "max-w-96 whitespace-pre-line text-sm text-neutral-600",
          direction === "column" ? "col-span-1" : "col-span-2",
        )}
      >
        {description}
      </div>
      <div
        className={cn(
          direction === "column" ? "col-span-1" : "col-span-2 pt-4",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default SettingsBlock;
