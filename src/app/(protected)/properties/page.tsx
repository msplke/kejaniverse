import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

export default async function Page() {
  const properties = await api.property.getAllUnderOwner();

  if (properties.length === 0) {
    redirect("/properties/new");
  } else {
    redirect(`/properties/${properties[0]?.id}`);
  }
}
