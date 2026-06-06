import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";

import { cn } from "..";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-4xl text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        destructive:
          "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-xs",
        outline:
          "bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "from-primary-400 to-primary-600 border-0 bg-gradient-to-br text-white shadow-md hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-4xl px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-4xl px-6 has-[>svg]:px-4",
        icon: "size-10 [&_svg]:size-3",
        "icon-sm": "size-8 [&_svg]:size-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  // When loading, render button content with loading spinner overlay
  if (loading && !asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), "relative", className)}
        disabled={disabled ?? loading}
        {...props}
      >
        {/* Keep children in DOM but invisible to preserve button width */}
        <span className="opacity-0">{children}</span>
        {/* Absolute positioned spinner */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled ?? loading}
      {...props}
    >
      {children}
    </Comp>
  );
};
