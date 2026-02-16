"use client";

import QueryProvider from "@/lib/providers/QueryProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <QueryProvider>{children}</QueryProvider>
    </>
  );
}