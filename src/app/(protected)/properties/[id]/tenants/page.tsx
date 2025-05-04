import Link from "next/link";

import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/tables/data-table";
import { tenantTableColumns } from "~/components/ui/tables/table-columns/tenants";
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
      <DataTable
        columns={tenantTableColumns}
        data={tenants}
        filterOption={{ columnKey: "name" }}
      />
    </div>
  );
}
