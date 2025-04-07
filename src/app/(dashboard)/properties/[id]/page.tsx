import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { property, unit, unitType } from "~/server/db/schema";

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

  const unitTypes = await db
    .select({ id: unitType.id })
    .from(unitType)
    .where(eq(unitType.propertyId, id));

  const currentUnits = [];

  for (const type of unitTypes) {
    const unitData = await db
      .select({ name: unit.unitName })
      .from(unit)
      .where(eq(unit.unitTypeId, type.id));

    currentUnits.push(...unitData);
  }

  return (
    <div>
      <div>
        <h1 className="text-sm">Overview</h1>
        <p className="text-2xl font-bold">{currentProperty[0].name}</p>
        <div className="my-8">
          {currentUnits.length === 0 ? (
            <Link href={`/properties/${id}/units/new`}>
              <Button className="cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Create Unit</span>
              </Button>
            </Link>
          ) : (
            <div>Dashboard Content</div>
          )}
        </div>
      </div>
    </div>
  );
}
