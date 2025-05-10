import Link from "next/link";

import { Icons } from "~/components/icons";
import { DataTable } from "~/components/tables/data-table";
import { unitTableColumns } from "~/components/tables/table-columns/units";
import { Button } from "~/components/ui/button";
import { getUnits } from "~/server/actions/units";

type Params = Promise<{ id: string }>;

export default async function UnitsPage({ params }: { params: Params }) {
  const { id } = await params;

  const units = await getUnits(id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="my-4 text-2xl font-bold">Units</h1>
        <Button asChild>
          <Link href={`/properties/${id}/units/new`}>
            <Icons.plus />
            Add Unit
          </Link>
        </Button>
      </div>
      <DataTable
        columns={unitTableColumns}
        data={units}
        filterOptions={{ keywordFilterKey: "name" }}
      />
    </div>
  );
}
