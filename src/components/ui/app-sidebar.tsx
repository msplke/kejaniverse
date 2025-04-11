"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Box,
  ChevronDown,
  Home,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type AppSidebarProps = {
  properties: {
    id: string;
    name: string;
  }[];
  id: string;
};

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  subItems: {
    title: string;
    url: string;
  }[];
};

export function AppSidebar({ id, properties }: AppSidebarProps) {
  const property = properties.find((property) => property.id === id);

  if (!property) {
    return null;
  }

  // Menu items.
  const items: NavItem[] = [
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
      title: "Payments",
      url: `/properties/${id}/payments`,
      icon: Banknote,
      subItems: [],
    },
    {
      title: "Settings",
      url: `/properties/${id}/settings`,
      icon: Settings,
      subItems: [],
    },
  ];

  return (
    <Sidebar>
      <Header property={property} properties={properties} />
      <SidebarContent>
        <SidebarNavItems items={items} />
      </SidebarContent>
    </Sidebar>
  );
}

type HeaderProps = {
  property: { id: string; name: string };
  properties: { id: string; name: string }[];
};

function Header({ property, properties }: HeaderProps) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                {property.name}
                <ChevronDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
              {properties.map((property) => (
                <DropdownMenuItem key={property.id}>
                  <Link href={`/properties/${property.id}`}>
                    {property.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

type SidebarNavItemsProps = {
  items: NavItem[];
};

function SidebarNavItems({ items }: SidebarNavItemsProps) {
  const pathname = usePathname();

  return (
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
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
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
  );
}
