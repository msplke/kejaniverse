"use client";

import { PropertySwitcher } from "~/components/dashboard/property-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { getSidebarLinks } from "~/config/dashboard";
import { SidebarNav } from "./sidebar-nav";

type AppSidebarProps = {
  properties: {
    id: string;
    name: string;
  }[];
  id: string;
};

export function AppSidebar({ id, properties }: AppSidebarProps) {
  const property = properties.find((property) => property.id === id);
  const sidebarLinks = getSidebarLinks(id);

  if (!property) {
    return null;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <PropertySwitcher property={property} properties={properties} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav sidebarLinks={sidebarLinks} />
      </SidebarContent>
    </Sidebar>
  );
}
