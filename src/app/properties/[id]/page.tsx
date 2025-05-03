import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";

import { PropertyDashboard } from "~/components/property-dashboard";
import { Button } from "~/components/ui/button";
import { getUnits } from "~/server/actions/units";
import { db } from "~/server/db";
import { property } from "~/server/db/schema";
import { api } from "~/trpc/server";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;

  const currentProperty = await db
    .select({ name: property.name })
    .from(property)
    .where(eq(property.id, id));

  if (!currentProperty[0]) {
    notFound();
  }

  const units = await getUnits(id);
  const dashboardData = await api.property.getPropertyDashboardData({
    propertyId: id,
  });

  return (
    <div>
      <div>
        <div className="my-8">
          {units.length === 0 ? (
            <Link href={`/properties/${id}/units/new`}>
              <Button className="cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Create Unit</span>
              </Button>
            </Link>
          ) : (
            <PropertyDashboard data={dashboardData} />
          )}
        </div>
      </div>
    </div>
  );
}
