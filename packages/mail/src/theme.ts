import type { TailwindConfig } from "react-email";

/**
 * Email-compatible Tailwind theme configuration.
 * Colors are converted from OKLCH (used in @turbo/tailwind-config) to HEX
 * for maximum email client compatibility.
 */
export const emailTheme: TailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1447e6",
          foreground: "#F5F3FF",
        },
        secondary: {
          DEFAULT: "#F5F5F7",
          foreground: "#1A1A1F",
        },
        // Background and foreground
        background: "#FFFFFF",
        foreground: "#1A1A1A",
        // Muted colors
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#F5F5F5",
          foreground: "#1A1A1A",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        // Border and input
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#A3A3A3",
        // Chart colors (for data visualization emails)
        chart: {
          1: "#93C5FD",
          2: "#6366F1",
          3: "#5B4AE4",
          4: "#4338CA",
          5: "#3730A3",
        },
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
};

/**
 * Dark theme variant for email clients that support it.
 * Note: Dark mode support in emails is limited.
 */
export const emailThemeDark: TailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1447e6",
          foreground: "#F5F3FF",
        },
        secondary: {
          DEFAULT: "#27272F",
          foreground: "#FAFAFA",
        },
        background: "#1A1A1A",
        foreground: "#FAFAFA",
        muted: {
          DEFAULT: "#262626",
          foreground: "#A3A3A3",
        },
        accent: {
          DEFAULT: "#404040",
          foreground: "#FAFAFA",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "#333333",
        input: "#404040",
        ring: "#525252",
      },
    },
  },
};
