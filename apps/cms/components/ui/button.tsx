import { type VariantProps, cva } from "class-variance-authority";
import Link, { type LinkProps } from "next/link";

import { Spinner } from "@/components/ui";
import { cn } from "@/utils";

interface BaseButtonProps extends VariantProps<typeof variants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
}

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    BaseButtonProps {
  isLoading?: boolean;
}

interface ButtonLinkProps extends LinkProps, BaseButtonProps {
  title: string;
}

const variants = cva(
  "h-9 rounded-md transition-colors px-4 justify-center space-x-2 inline-flex items-center font-medium text-sm border border-transparent",
  {
    variants: {
      variant: {
        primary:
          "text-white bg-neutral-800 hover:bg-neutral-900 active:bg-neutral-950 shadow-sm",
        secondary:
          "text-neutral-700 bg-white border-neutral-200 hover:bg-neutral-50 shadow-sm",
        "secondary-gray":
          "text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80",
        danger:
          "text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export function Button({
  variant,
  title,
  className,
  iconLeft,
  iconRight,
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps & { children?: React.ReactNode }) {
  const content = title ?? children;
  const derivedAriaLabel =
    title ?? (typeof content === "string" ? (content as string) : undefined);
  return (
    <button
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      aria-label={derivedAriaLabel}
      {...props}
      className={cn(
        variants({ variant }),
        isLoading && "opacity-60",
        className,
      )}
    >
      {isLoading && <Spinner size={20} />}
      {!isLoading && iconLeft ? iconLeft : null}
      {content ? <span>{content}</span> : null}
      {iconRight}
    </button>
  );
}

export function ButtonLink({
  title,
  variant,
  className,
  iconLeft,
  iconRight,
  children,
  ...props
}: ButtonLinkProps & { children?: React.ReactNode }) {
  const content = title ?? children;
  return (
    <Link
      {...props}
      aria-label={typeof content === "string" ? (content as string) : undefined}
      className={cn(variants({ variant }), className)}
    >
      {iconLeft ? iconLeft : null}
      {content ? <span>{content}</span> : null}
      {iconRight}
    </Link>
  );
}
