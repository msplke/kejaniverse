"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronsUpDown, Plus } from "lucide-react";

import { Icons } from "~/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";

type PropertySwitcherProps = {
  property: { id: string; name: string };
  properties: { id: string; name: string }[];
};

export function PropertySwitcher({
  property,
  properties,
}: PropertySwitcherProps) {
  const { isMobile } = useSidebar();
  const [activeProperty, setActiveProperty] = useState(property);

  if (!activeProperty) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Icons.house className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeProperty.name}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Properties
            </DropdownMenuLabel>

            {properties.map((property, index) => (
              <DropdownMenuItem
                key={property.name}
                onClick={() => {
                  setActiveProperty(property);
                  redirect(`/properties/${property.id}`);
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Icons.house className="size-4 shrink-0" />
                </div>
                {property.name}
                <DropdownMenuShortcut>⌘ {index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <Link href="/properties/new">
              <DropdownMenuItem className="gap-2 p-2">
                <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Create property
                </div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
