"use client";

import type { PropsWithChildren } from "react";

import { cn } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

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
    <Card className="grid grid-cols-2 gap-x-8 p-0 bg-white overflow-hidden">
      <div className="col-span-2 p-6 pb-0">
         <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div
        className={cn(
          "max-w-96 whitespace-pre-line text-sm text-neutral-600 px-6 pt-2 pb-6",
          direction === "column" ? "col-span-1" : "col-span-2",
        )}
      >
        {description}
      </div>
      <div
        className={cn(
          "px-6 pb-6",
          direction === "column" ? "col-span-1 pt-2" : "col-span-2 pt-0",
        )}
      >
        {children}
      </div>
    </Card>
  );
}

export default SettingsBlock;
