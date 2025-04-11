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
        <div className="bg-background border-border sticky top-0 z-10 flex items-center border-b py-4">
          <SidebarTrigger />
        </div>
        <div className="pt-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
