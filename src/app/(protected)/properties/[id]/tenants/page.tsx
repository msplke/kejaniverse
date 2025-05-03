import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getTenants } from "~/server/actions/tenants";

type Params = Promise<{ id: string }>;

export default async function TenantsPage({ params }: { params: Params }) {
  const { id } = await params;

  const tenants = await getTenants(id);

  if (tenants.length === 0) {
    return (
      <Link href={`/properties/${id}/tenants/new`}>
        <Button>Add Tenant</Button>
      </Link>
    );
  }

  return (
    <div>
      <h1 className="my-4 text-2xl font-bold">Tenants</h1>
      <Table className="max-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead className="w-[100px]">Phone Number</TableHead>
            <TableHead className="w-[100px]">Email</TableHead>
            <TableHead className="w-[100px]">Move-in Date</TableHead>
            <TableHead className="w-[100px]">Move-out Date</TableHead>
            <TableHead className="w-[100px]">Cumulative Rent Paid</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tenants.map(({ tenant }) => (
            <TableRow key={tenant.id}>
              <TableCell className="font-medium">
                {tenant.firstName} {tenant.lastName}
              </TableCell>
              <TableCell className="font-medium">
                {tenant.phoneNumber}
              </TableCell>
              <TableCell>{tenant.email}</TableCell>
              <TableCell>{tenant.moveInDate}</TableCell>
              <TableCell>{tenant.moveOutDate ?? "N/A"}</TableCell>
              <TableCell>{tenant.cumulativeRentPaid}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
