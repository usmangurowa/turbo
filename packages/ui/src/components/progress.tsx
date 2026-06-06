"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "..";

interface ProgressProps extends React.ComponentProps<
  typeof ProgressPrimitive.Root
> {
  /** Whether to animate from 0 to value on mount. Defaults to false. */
  animate?: boolean;
}

function Progress({
  className,
  value,
  animate = false,
  ...props
}: ProgressProps) {
  const [mounted, setMounted] = React.useState(!animate);

  React.useEffect(() => {
    if (!animate) return;
    // Delay to trigger the animation after mount
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, [animate]);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-muted relative flex h-3 w-full items-center overflow-x-hidden rounded-4xl",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary size-full flex-1",
          animate ? "transition-all duration-500 ease-out" : "transition-all",
        )}
        style={{
          transform: `translateX(-${100 - (mounted ? (value ?? 0) : 0)}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
