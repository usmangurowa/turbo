"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/hooks/use-session";
import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

import { syncUserIdentity } from "@turbo/analytics";

export const useIdentifyUser = () => {
  const { data: session } = useSession();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const newId = syncUserIdentity(
      session?.user,
      identifiedRef.current,
      Sentry,
      posthog,
    );

    if (newId !== identifiedRef.current) {
      identifiedRef.current = newId;
    }
  }, [session?.user]);
};
