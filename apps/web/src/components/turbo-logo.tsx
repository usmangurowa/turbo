"use client";

import { cn } from "@turbo/ui";

const sizes = {
  sm: 20,
  md: 32,
  lg: 40,
  xl: 56,
} as const;

type LogoSize = keyof typeof sizes;

interface TurboLogoProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Size preset for the logo
   * @default "md"
   */
  size?: LogoSize;
}

/**
 * Turbo logo component - renders as inline SVG for crisp scaling and styling.
 *
 * @example
 * ```tsx
 * <TurboLogo size="lg" className="text-primary" />
 * ```
 */
export const TurboLogo = ({
  size = "md",
  className,
  ...props
}: TurboLogoProps) => {
  const dimension = sizes[size];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M7.72266 0H27.3323C31.8914 0 34.6927 3.33857 32.3308 5.9434L22.7732 16.4727L17.5549 22.196L13.5451 26.5618C12.5564 27.6625 13.7099 29.0566 15.6324 29.0566H19.3676C21.2901 29.0566 22.4436 27.6625 21.4549 26.5618L18.5986 23.4067L23.8168 17.6834L34.1434 29.0566C36.5054 31.6614 33.704 35 29.1449 35H5.85508C1.29599 35 -1.50539 31.6614 0.856555 29.0566L17.5549 10.7495L19.6422 8.43816C20.6309 7.33753 19.4774 5.9434 17.5549 5.9434C15.6324 5.9434 14.4789 7.33753 15.4676 8.43816L16.6211 9.68553L11.4029 15.4088L2.72414 5.9434C0.362196 3.30189 3.16357 0 7.72266 0Z"
        fill="currentColor"
      />
    </svg>
  );
};
