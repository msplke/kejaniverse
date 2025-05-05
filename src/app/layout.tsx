import { Inter as FontSans } from "next/font/google";
import LocalFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";

import "~/styles/globals.css";

import { Toaster } from "~/components/ui/sonner";
import { cn, constructMetadata } from "~/lib/utils";
import { TRPCReactProvider } from "~/trpc/react";
import { TailwindIndicator } from "./_components/tailwind-indicator";
import { ThemeProvider } from "./_components/theme-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = LocalFont({
  src: "../styles/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "bg-background min-h-screen font-sans antialiased",
            fontSans.variable,
            fontHeading.variable,
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCReactProvider>{children}</TRPCReactProvider>

            <TailwindIndicator />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
