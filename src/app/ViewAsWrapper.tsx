/**
 * ViewAsWrapper - Client component wrapper for ViewAs context
 *
 * Wraps children with ViewAsProvider and displays the ViewAsBanner.
 * This is a client component because ViewAsProvider uses React state.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

"use client";

import { ReactNode } from "react";
import { ViewAsProvider, ViewAsBanner } from "@/components/view-as";

interface ViewAsWrapperProps {
  children: ReactNode;
}

export function ViewAsWrapper({ children }: ViewAsWrapperProps) {
  // Check if view-as is enabled (via env var or dev mode)
  const isEnabled =
    typeof window !== "undefined" &&
    (process.env.NEXT_PUBLIC_DEMO_VIEW_AS === "1" ||
      process.env.NODE_ENV === "development");

  return (
    <ViewAsProvider enabled={isEnabled}>
      <ViewAsBanner />
      {children}
    </ViewAsProvider>
  );
}
