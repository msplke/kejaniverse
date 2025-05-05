import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";

import { Icons } from "~/components/icons";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";

export function ForLandlords() {
  return (
    <section id="landlords" className="bg-muted w-full py-12 md:py-24 lg:py-32">
      <MaxWidthWrapper>
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-primary/10 text-primary inline-block w-fit rounded-xl px-3 py-1 text-sm">
              For Landlords
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Take control of your rental business
            </h2>
            <p className="text-muted-foreground md:text-xl">
              Stop chasing payments and start growing your property portfolio
              with our comprehensive management solution.
            </p>
            <ul className="grid gap-3">
              {[
                "Collect rent automatically and on time",
                "Track payment status across all properties",
                "Manage tenant relationships efficiently",
                "Reduce administrative overhead by 80%",
                "Access your dashboard from any device",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Icons.checkCircle className="text-primary h-5 w-5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div>
              <SignedOut>
                <SignUpButton>
                  <Button size="lg">
                    Get Started <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <Link href="/properties">
                  <Button size="lg">Properties</Button>
                </Link>
              </SignedIn>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-background relative h-[500px] w-full overflow-hidden rounded-lg border shadow-xl">
              <Image
                src="/placeholder.svg?height=1000&width=800"
                alt="Landlord Dashboard"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
