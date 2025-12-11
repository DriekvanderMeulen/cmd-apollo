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
  "aria-label"?: string;
}

const variants = cva(
  "rounded-md transition-colors justify-center space-x-2 inline-flex items-center font-medium border border-transparent disabled:cursor-not-allowed disabled:opacity-70",
  {
    variants: {
      variant: {
        primary:
          "text-white bg-accent hover:bg-accent/90 active:bg-accent/80 shadow-sm disabled:bg-neutral-200 disabled:text-neutral-500 disabled:border-neutral-200",
        secondary:
          "text-neutral-700 bg-white border-neutral-200 hover:bg-neutral-50 shadow-sm disabled:text-neutral-500 disabled:bg-neutral-100 disabled:border-neutral-200",
        "secondary-gray":
          "text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 disabled:text-neutral-500 disabled:bg-neutral-100 disabled:border-neutral-200",
        ghost:
          "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 disabled:text-neutral-400 disabled:hover:bg-transparent",
        danger:
          "text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-sm disabled:bg-neutral-200 disabled:text-neutral-500 disabled:border-neutral-200",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-sm",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export function Button({
  variant,
  size,
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
        variants({ variant, size }),
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
  size,
  className,
  iconLeft,
  iconRight,
  children,
  ...props
}: ButtonLinkProps & { children?: React.ReactNode }) {
  const content = title ?? children;
  return (
    <Link
      aria-label={
        props["aria-label"] ??
        (typeof content === "string" ? (content as string) : undefined)
      }
      {...props}
      className={cn(variants({ variant, size }), className)}
    >
      {iconLeft ? iconLeft : null}
      {content ? <span>{content}</span> : null}
      {iconRight}
    </Link>
  );
}
