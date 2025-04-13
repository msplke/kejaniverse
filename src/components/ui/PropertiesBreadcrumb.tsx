"use client";

import { usePathname } from "next/navigation";

// This component is used to display a breadcrumb navigation for the
// routes in the under the properties/[id] path. It must be rendered under a
// SidebarContextProvider to work properly.
// It is used in the properties/[id]/layout.tsx file.
function PropertiesBreadcrumb() {
  const pathname = usePathname();

  // Remove "properties/[id]" from the path
  let breadcrumbSegments = pathname
    ?.split("/")
    .filter((segment) => segment && !segment.startsWith("properties"));

  if (breadcrumbSegments.length === 1) {
    breadcrumbSegments[0] = "overview";
  } else {
    breadcrumbSegments = breadcrumbSegments.slice(1);
  }

  return (
    <nav aria-label="breadcrumb">
      <ol className="text-muted-foreground flex text-sm">
        {breadcrumbSegments?.map((segment, index) => (
          <li key={index} className="breadcrumb-item capitalize">
            {segment}
            {index === breadcrumbSegments.length - 1 ? "" : "/"}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default PropertiesBreadcrumb;
