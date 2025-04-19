import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getUnits } from "~/server/actions";

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
      <Table className="max-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Unit Name</TableHead>
            <TableHead className="w-[100px]">Unit Type</TableHead>
            <TableHead className="w-[100px]">Is Occupied</TableHead>
            <TableHead className="text-right">Rent Price</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {units.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell className="font-medium">{unit.name}</TableCell>
              <TableCell className="font-medium">{unit.unitType}</TableCell>
              <TableCell className="font-medium">
                {unit.occupied ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-right">{unit.rentPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
