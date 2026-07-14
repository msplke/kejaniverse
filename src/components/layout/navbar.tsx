"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

import { Icons } from "~/components/icons";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ModeToggle } from "~/components/mode-toggle";
import { Button } from "~/components/ui/button";
import { marketingConfig } from "~/config/marketing";
import { siteConfig } from "~/config/site";
import { useScroll } from "~/hooks/use-scroll";
import { cn } from "~/lib/utils";

export function NavBar({ scroll = false }: { scroll?: boolean }) {
  const scrolled = useScroll(50);
  const segment = useSelectedLayoutSegment();
  const links = marketingConfig.mainNav;

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-transparent") : "border-b"
      }`}
    >
      <MaxWidthWrapper className="flex h-14 items-center justify-between py-4">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo />
            <span className="text-lg font-bold">{siteConfig.name}</span>
          </Link>

          {links?.length ? (
            <nav className="hidden gap-6 md:flex">
              {links?.map((link, index) => (
                <Link
                  key={`${index}-${link.title}`}
                  href={link.disabled ? "#" : link.href}
                  prefetch={true}
                  className={cn(
                    "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                    link.href.startsWith(`/${segment}`)
                      ? "text-foreground"
                      : "text-foreground/60",
                    link.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Show when="signed-out">
            <SignInButton>
              <Button size="sm" variant="ghost">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton>
              <Button size="sm">Get Started</Button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link href="/properties">
              <Button size="sm">Properties</Button>
            </Link>
          </Show>

          <ModeToggle />
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
