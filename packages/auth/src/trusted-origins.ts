export const BASE_TRUSTED_ORIGINS = [
  "expo://",
  "http://localhost:3000",
  "https://turbo.app",
  "https://www.turbo.app",
] as const;

const ALLOWED_CUSTOM_SCHEMES = ["expo://"] as const;

const toTrustedOrigin = (value: string) => {
  const lowerValue = value.toLowerCase().trim();

  if (ALLOWED_CUSTOM_SCHEMES.some((scheme) => lowerValue.startsWith(scheme))) {
    return lowerValue;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : null;
  } catch {
    return null;
  }
};

export const resolveTrustedOrigins = (
  ...origins: (string | undefined | null)[]
): string[] => {
  const normalizedOrigins = origins
    .filter((origin): origin is string => typeof origin === "string")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map(toTrustedOrigin)
    .filter((origin): origin is string => origin !== null);

  return [...new Set(normalizedOrigins)];
};
