"use client";

import { StoreProvider } from "@/lib/store";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
