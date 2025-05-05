import type { Feature, FooterItem, MarketingConfig } from "~/types";

export const marketingConfig: MarketingConfig = {
  mainNav: [
    {
      title: "Features",
      href: "#features",
    },
    {
      title: "For Landlords",
      href: "#landlords",
    },
    {
      title: "For Tenants",
      href: "#tenants",
    },
  ],
};

export const features: Feature[] = [
  {
    title: "Automated Rent Collection",
    description:
      "Accept payments via mobile money or cards with automatic reconciliation and receipt generation.",

    icon: "creditCard",
  },
  {
    title: "Secure Escrow System",
    description:
      "All payments are held in secure escrow before being routed to landlords with complete transparency.",

    icon: "shield",
  },
  {
    title: "Financial Reporting",
    description:
      "Comprehensive dashboards with real-time metrics on occupancy rates, collections, and outstanding balances.",
    icon: "barChart",
  },
  {
    title: "Tenant Management",
    description:
      "Easily manage tenant information, lease agreements, and communication in one central location.",
    icon: "users",
  },
  {
    title: "Property Portfolio",
    description:
      "Organize and track all your properties and units with detailed information and occupancy status.",
    icon: "building",
  },
  {
    title: "Real-time Notifications",
    description:
      "Get instant alerts for payments, lease expirations, and other important events via email.",
    icon: "clock",
  },
];

export const footerItems: FooterItem[] = [
  {
    title: "Contact",
    href: "#",
    disabled: true,
  },
  {
    title: "Terms",
    href: "#",
    disabled: true,
  },
  {
    title: "Privacy",
    href: "#",
    disabled: true,
  },
];
