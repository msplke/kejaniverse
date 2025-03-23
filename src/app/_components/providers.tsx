"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "~/components/ui/sonner";
import { TailwindIndicator } from "./tailwind-indicator";
import { ThemeProvider } from "./theme-provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}

        <TailwindIndicator />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
