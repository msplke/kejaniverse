import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "~/styles/globals.css";

import { cn, constructMetadata } from "~/lib/utils";
import { Providers } from "./_components/providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
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
            geist.variable,
          )}
        >
          <Providers>
            <div className="flex-1">{children}</div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
