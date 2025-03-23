import { getBaseUrl } from "~/lib/utils";

type SiteConfig = {
  name: string;
  url: string;
  description: string;
  authors: { name: string; url: string }[];
  keywords: string[];
  ogImage: string;
  links: {
    github: string;
  };
};

export const siteConfig: SiteConfig = {
  name: "Kejaniverse",
  url: getBaseUrl(),
  description:
    "Say goodbye to the hassle of manual rent tracking and reconciliation.",
  authors: [
    { name: "Peter Kibuchi", url: "https://github.com/peterkibuchi" },
    { name: "Glen Ochieng", url: "https://github.com/Mirror83" },
  ],
  keywords: ["Rent Management"],
  ogImage: `${getBaseUrl()}/og.png`,
  links: {
    github: "https://github.com/peterkibuchi/kejaniverse",
  },
};
