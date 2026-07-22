/**
 * App constants
 */

export const SUPPORT_EMAIL = "usesilo.app@gmail.com";

export const getThumbUrl = (seed: string): string => {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&scale=80&backgroundColor=0659FF&shapeColor=ffffff`;
};
