// app/providers.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";

export default function Providers({ children }: PropsWithChildren) {
  const client = useMemo(() => {
    // Works in dev (npx convex dev injects __CONVEX_URL) and in prod (env var)
    const url =
      process.env.NEXT_PUBLIC_CONVEX_URL ||
      (typeof window !== "undefined" ? (window as any).__CONVEX_URL : undefined);

    if (!url) {
      console.warn(
        "Convex URL missing. Start `npx convex dev` or set NEXT_PUBLIC_CONVEX_URL."
      );
    }
    return new ConvexReactClient(url ?? "");
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
