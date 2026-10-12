import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { AppSidebar } from "~/components/dashboard/app-sidebar";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ModeToggle } from "~/components/mode-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { api } from "~/trpc/server";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const properties = await api.property.getAllUnderOwner();
  const { id } = await params;

  // Central ownership check for all /properties/[id]/* pages:
  // `getAllUnderOwner` only returns properties owned by the authenticated
  // user, so an id outside that list either doesn't exist or isn't theirs.
  if (!properties.some((property) => property.id === id)) {
    notFound();
  }

  return (
    <SidebarProvider>
      <AppSidebar id={id} properties={properties} />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 bg-background lg:h-[60px]">
          <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3">
            <div className="w-full flex-1">
              <SidebarTrigger />
            </div>
            <UserButton />
            <ModeToggle />
          </MaxWidthWrapper>
        </header>

        <main className="flex-1">
          <MaxWidthWrapper className="flex h-full max-w-7xl flex-col gap-4 lg:gap-6">
            {children}
          </MaxWidthWrapper>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
