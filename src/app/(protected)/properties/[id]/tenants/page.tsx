import Link from "next/link";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/tables/data-table";
import { tenantTableColumns } from "~/components/ui/tables/table-columns/tenants";
import { getTenants } from "~/server/actions/tenants";

type Params = Promise<{ id: string }>;

export default async function TenantsPage({ params }: { params: Params }) {
  const { id } = await params;

  const tenants = await getTenants(id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="my-4 text-2xl font-bold">Tenants</h1>
        <Button asChild>
          <Link href={`/properties/${id}/tenants/new`}>
            <Icons.plus />
            Add Tenant
          </Link>
        </Button>
      </div>
      <DataTable
        columns={tenantTableColumns}
        data={tenants}
        filterOptions={{ keywordFilterKey: "name" }}
      />
    </div>
  );
}
