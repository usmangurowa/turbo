import Link from "next/link";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@turbo/ui/components/button";
import { Icon } from "@turbo/ui/components/icon";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background relative isolate flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6 md:p-10">
      <div
        aria-hidden
        className="bg-foreground/5 pointer-events-none absolute -top-40 -right-40 -z-10 size-160 rounded-full blur-[160px]"
      />
      <div
        aria-hidden
        className="bg-foreground/5 pointer-events-none absolute -bottom-40 -left-40 -z-10 size-160 rounded-full blur-[160px]"
      />

      <Button
        asChild
        variant="outline"
        size="sm"
        className="absolute top-6 left-6"
      >
        <Link href="/">
          <Icon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back
        </Link>
      </Button>

      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
