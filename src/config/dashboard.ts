import { type SidebarNavItem } from "~/types";

export const getSidebarLinks = (id: string): SidebarNavItem[] => [
  {
    title: "MENU",
    items: [
      {
        title: "Overview",
        href: `/properties/${id}`,
        icon: "dashboard",
      },
      {
        title: "Units",
        href: `/properties/${id}/units`,
        icon: "unit",
      },
      {
        title: "Tenants",
        href: `/properties/${id}/tenants`,
        icon: "users",
      },
      {
        title: "Payments",
        href: `/properties/${id}/payments`,
        icon: "payments",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        href: `/properties/${id}/settings`,
        icon: "settings",
        disabled: true,
      },
      {
        title: "Homepage",
        href: "/",
        icon: "home",
      },
    ],
  },
];
