"use client";

import { useMemo } from "react";

// Placeholder hook; replace with Convex or Amplify auth wiring.
export const useUser = () => {
  return useMemo(
    () => ({
      id: null,
      isLoading: false,
      roles: [] as string[]
    }),
    []
  );
};

export default useUser;
