import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

import { Icons } from "~/components/icons";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";

export function HeroLanding() {
  return (
    <section className="from-background to-muted w-full bg-gradient-to-b py-12 md:py-24">
      <MaxWidthWrapper>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2 text-balance">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Simplify Rent Collection & Property Management
              </h1>
              <p className="text-muted-foreground max-w-[600px] md:text-xl">
                The complete platform for landlords to manage properties, track
                payments, and keep tenants happy — all in one secure place.
              </p>
            </div>

            <div className="flex gap-2">
              <SignedOut>
                <SignUpButton>
                  <Button size="lg">
                    Get Started <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignUpButton>

                <SignInButton>
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link href="/properties">
                  <Button size="lg">Properties</Button>
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="bg-background relative h-[400px] w-full overflow-hidden rounded-lg border shadow-xl">
              <Image
                src="/placeholder.svg?height=800&width=1200"
                alt="Dashboard Preview"
                fill
                className="aspect-video object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
