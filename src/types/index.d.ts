import { type Icons } from "~/components/icons";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  icon?: keyof typeof Icons;
};

export type SidebarNavItem = {
  title: string;
  items: NavItem[];
  icon?: keyof typeof Icons;
};
