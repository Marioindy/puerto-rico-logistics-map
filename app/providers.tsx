// app/providers.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";

interface ConvexWindow extends Window {
  __CONVEX_URL?: string;
}

const readConvexUrlFromWindow = (): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const candidate = window as Partial<ConvexWindow>;
  return typeof candidate.__CONVEX_URL === "string" ? candidate.__CONVEX_URL : undefined;
};

export default function Providers({ children }: PropsWithChildren) {
  const client = useMemo(() => {
    // Works in dev (npx convex dev injects __CONVEX_URL) and in prod (env var)
    const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? readConvexUrlFromWindow();

    if (!url) {
      console.warn("Convex URL missing. Start `npx convex dev` or set NEXT_PUBLIC_CONVEX_URL.");
    }

    return new ConvexReactClient(url ?? "");
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
