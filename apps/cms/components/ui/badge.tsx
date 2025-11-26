import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/80",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
        destructive:
          "bg-red-500 text-neutral-50 hover:bg-red-500/80",
        outline: "text-neutral-950 border border-neutral-200",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        neutral: "bg-neutral-100 text-neutral-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

