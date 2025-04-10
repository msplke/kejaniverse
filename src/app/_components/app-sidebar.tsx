"use client";

import Link from "next/link";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";

export function AppSidebar({ id }: { id: string }) {
  const pathname = usePathname();

  // Menu items.
  const items = [
    {
      title: "Overview",
      url: `/properties/${id}`,
      icon: Home,
      subItems: [],
    },
    {
      title: "Units",
      url: `/properties/${id}/units`,
      icon: Box,
      subItems: [
        {
          title: "Add Unit",
          url: `/properties/${id}/units/new`,
        },
      ],
    },
    {
      title: "Tenants",
      url: `/properties/${id}/tenants`,
      icon: Users,
      subItems: [
        {
          title: "Add Tenant",
          url: `/properties/${id}/tenants/new`,
        },
      ],
    },
    {
      title: "Settings",
      url: `/properties/${id}/settings`,
      icon: Settings,
      subItems: [],
    },
  ];
  // const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Kejaniverse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.subItems.length > 0 && (
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                              >
                                <Link href={subItem.url}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
