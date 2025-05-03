import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/tables/data-table";
import { unitTableColumns } from "~/components/ui/tables/table-columns/units";
import { getUnits } from "~/server/actions/units";

type Params = Promise<{ id: string }>;

export default async function UnitsPage({ params }: { params: Params }) {
  const { id } = await params;

  const units = await getUnits(id);

  if (units.length === 0) {
    return <Button>Create Unit</Button>;
  }

  return (
    <div>
      <h1 className="my-4 text-2xl font-bold">Units</h1>
      <DataTable columns={unitTableColumns} data={units} />
    </div>
  );
}
