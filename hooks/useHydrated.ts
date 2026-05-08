"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after the component has hydrated on the client.
 * Use to avoid Zustand localStorage hydration mismatch errors in Next.js App Router.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
