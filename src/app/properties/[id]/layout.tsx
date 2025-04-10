import { AppSidebar } from "~/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { getProperties } from "~/server/actions";

type Params = Promise<{ id: string }>;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;

  const properties = await getProperties();

  return (
    <SidebarProvider>
      <AppSidebar id={id} properties={properties} />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
