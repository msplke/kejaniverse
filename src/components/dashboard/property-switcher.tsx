"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icons } from "~/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [activeProperty, setActiveProperty] = useState(property);

  if (!activeProperty) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Icons.house className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {activeProperty.name}
              </span>
            </div>
            <Icons.chevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Properties
              </DropdownMenuLabel>

              {properties.map((property) => (
                <DropdownMenuItem
                  key={property.id}
                  onClick={() => {
                    setActiveProperty(property);
                    router.push(`/properties/${property.id}`);
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Icons.house className="size-4 shrink-0" />
                  </div>
                  {property.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              render={<Link href="/properties/new" />}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Icons.plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create property
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
