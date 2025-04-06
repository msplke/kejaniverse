import Image from "next/image";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Github, Home, Linkedin, Twitter } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Home className="text-primary h-6 w-6" />
            <span className="text-xl font-bold">Kejaniverse</span>
          </div>
          <nav className="hidden gap-6 md:flex"></nav>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <button className="cursor-pointer">Sign In</button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="cursor-pointer">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/properties">
                <Button size="sm" className="cursor-pointer">
                  Properties
                </Button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline your rent management
                  </h1>
                  <p className="text-muted-foreground max-w-[600px] md:text-xl">
                    Say goodbye to the hassle of manual rent collection and
                    tracking.
                  </p>
                </div>
              </div>
              {/* 
              Photo by 
              <a href="https://unsplash.com/@lucabravo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Luca Bravo</a> on <a href="https://unsplash.com/photos/graphing-artwork-xnqVGsbXgV4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
              */}
              <div>
                <Image
                  src="/images/luca-bravo-xnqVGsbXgV4-unsplash.jpg"
                  width={800}
                  height={500}
                  alt="Hero Image"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
                <div className="mt-2 flex w-full justify-end text-sm text-gray-600">
                  <div>
                    <a href="https://unsplash.com/@lucabravo?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                      Luca Bravo
                    </a>{" "}
                    on{" "}
                    <a href="https://unsplash.com/photos/graphing-artwork-xnqVGsbXgV4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                      Unsplash
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-background w-full border-t">
        <div className="container flex flex-col gap-8 px-4 py-12 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Home className="text-primary h-6 w-6" />
                <span className="text-xl font-bold">Kejaniverse</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Streamlined rent management
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Product</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Features
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Integrations
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Resources</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Blog
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Documentation
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Guides
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Support
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium">Company</h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  About
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
              <h3 className="text-base font-medium">Subscribe</h3>
              <p className="text-muted-foreground text-sm">
                Get the latest news and updates from Kejaniverse.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} Kejaniverse. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
