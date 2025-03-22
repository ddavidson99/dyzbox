"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Get the NEXT_PUBLIC_BASE_URL from environment
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  
  return (
    <SessionProvider
      // Force session refresh when window focuses
      refetchOnWindowFocus={true}
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  );
} 