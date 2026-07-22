import Link from "next/link";
import { TurboLogo } from "@/components/turbo-logo";

import { cn } from "@turbo/ui/lib/utils";

interface AuthHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export const AuthHeader = ({ title, children, className }: AuthHeaderProps) => (
  <div
    className={cn("flex flex-col items-center gap-2 text-center", className)}
  >
    <Link
      href="/"
      className="bg-card mb-3 flex size-12 items-center justify-center rounded-2xl border shadow-xs"
    >
      <TurboLogo size="sm" className="text-primary" />
      <span className="sr-only">Turbo</span>
    </Link>
    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    {children ? (
      <p className="text-muted-foreground text-sm text-balance">{children}</p>
    ) : null}
  </div>
);
