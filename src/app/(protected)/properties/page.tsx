import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

export default async function Page() {
  const propertyId = await api.property.getFirstUnderOwner();

  if (!propertyId) {
    redirect("/properties/new");
  } else {
    redirect(`/properties/${propertyId}`);
  }
}
