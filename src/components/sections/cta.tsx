import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

import { Icons } from "~/components/icons";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";

export function CallToAction() {
  return (
    <section id="cta" className="w-full bg-primary/5 py-12 md:py-24 lg:py-32">
      <MaxWidthWrapper>
        <div className="flex flex-col items-center justify-end space-y-4 text-center text-balance">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to transform your property management?
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join plenty of landlords who have simplified their rental business
              with Kejaniverse.
            </p>
          </div>

          <div className="flex gap-2">
            <Show when="signed-out">
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
            </Show>

            <Show when="signed-in">
              <Link href="/properties">
                <Button size="lg">Properties</Button>
              </Link>
            </Show>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
