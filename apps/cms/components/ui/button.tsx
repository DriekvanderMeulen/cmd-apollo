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
  "h-11 rounded-ui font-bold transition-all duration-100 px-5 justify-center space-x-3 inline-flex items-center font-semibold leading-11",
  {
    variants: {
      variant: {
        primary: "text-white bg-primary",
        secondary: "text-black bg-white",
        "secondary-gray": "text-black bg-neutral-100",
        danger: "text-white bg-red-600",
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
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={title}
      {...props}
      className={cn(
        variants({ variant }),
        isLoading && "opacity-60",
        className,
      )}
    >
      {isLoading && <Spinner size={20} />}
      {!isLoading && iconLeft ? iconLeft : null}
      <span>{title}</span>
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
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      aria-label={title}
      className={cn(variants({ variant }), className)}
    >
      {iconLeft ? iconLeft : null}
      <span>{title}</span>
      {iconRight}
    </Link>
  );
}
