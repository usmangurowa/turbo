import { Platform } from "react-native";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import * as CheckboxPrimitive from "@rn-primitives/checkbox";

const DEFAULT_HIT_SLOP = 24;

function Checkbox({
  className,
  checkedClassName,
  indicatorClassName,
  iconClassName,
  ...props
}: CheckboxPrimitive.RootProps &
  React.RefAttributes<CheckboxPrimitive.RootRef> & {
    checkedClassName?: string;
    indicatorClassName?: string;
    iconClassName?: string;
  }) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "border-input dark:bg-input/30 size-4 shrink-0 rounded-[4px] border shadow-sm shadow-black/5",
        Platform.select({
          web: "focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer cursor-default transition-shadow outline-none focus-visible:ring-2 disabled:cursor-not-allowed",
          native: "overflow-hidden",
        }),
        props.checked && cn("border-primary", checkedClassName),
        props.disabled && "opacity-50",
        className,
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "bg-primary h-full w-full items-center justify-center",
          indicatorClassName,
        )}
      >
        <Icon
          as={Tick02Icon}
          size={12}
          strokeWidth={Platform.OS === "web" ? 2.5 : 3.5}
          className={cn("text-primary-foreground", iconClassName)}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
