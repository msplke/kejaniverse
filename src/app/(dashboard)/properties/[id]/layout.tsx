import { AppSidebar } from "~/app/_components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

type Params = Promise<{ id: string }>;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;

  return (
    <SidebarProvider>
      <AppSidebar id={id} />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
