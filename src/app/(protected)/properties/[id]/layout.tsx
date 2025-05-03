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
  params: { id },
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const properties = await api.property.getAllUnderOwner();

  return (
    <SidebarProvider>
      <AppSidebar id={id} properties={properties} />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-50 flex h-14 px-4 lg:h-[60px]">
          <MaxWidthWrapper className="flex max-w-7xl items-center gap-x-3">
            <div className="w-full flex-1">
              <SidebarTrigger />
            </div>

            <UserButton />
            <ModeToggle />
          </MaxWidthWrapper>
        </header>

        <main className="flex-1 p-4">
          <MaxWidthWrapper className="flex h-full max-w-7xl flex-col gap-4 px-0 lg:gap-6">
            {children}
          </MaxWidthWrapper>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
