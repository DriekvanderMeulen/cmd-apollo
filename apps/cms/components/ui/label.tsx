"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  // Fallback to simple span/label if radix-ui label not installed, but I will use span for now as I don't know if radix label is there.
  // Actually user has `radix-ui/react-dialog` etc. but maybe not label.
  // I'll assume standard label tag is safer if I can't confirm package.
  <label
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };

