"use client";

import { usePathname } from "next/navigation";
import { Box, Home, Settings, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export function AppSidebar({ id }: { id: string }) {
  // Menu items.
  const items = [
    {
      title: "Overview",
      url: `/properties/${id}/`,
      icon: Home,
    },
    {
      title: "Units",
      url: `/properties/${id}/units`,
      icon: Box,
    },
    {
      title: "Tenants",
      url: `/properties/${id}/tenants`,
      icon: Users,
    },
    {
      title: "Settings",
      url: `/properties/${id}/settings`,
      icon: Settings,
    },
  ];

  const pathname = usePathname();

  console.log("Pathname: ", pathname);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
