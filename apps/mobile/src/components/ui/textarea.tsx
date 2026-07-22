import type { TextInputProps } from "react-native";
import { Platform, TextInput } from "react-native";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 2, native: 8 }), // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  placeholderClassName,
  ...props
}: TextInputProps &
  React.RefAttributes<TextInput> & { placeholderClassName?: string }) {
  return (
    <TextInput
      className={cn(
        "text-foreground border-input dark:bg-input/30 flex min-h-16 w-full flex-row rounded-md border bg-transparent px-3 py-2 text-base shadow-sm shadow-black/5 md:text-sm",
        Platform.select({
          web: "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive field-sizing-content resize-y transition-[color,box-shadow] outline-none focus-visible:ring-2 disabled:cursor-not-allowed",
        }),
        props.editable === false && "opacity-50",
        className,
      )}
      // @ts-expect-error - placeholderClassName is not a valid prop for TextInput
      placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}

export { Textarea };
