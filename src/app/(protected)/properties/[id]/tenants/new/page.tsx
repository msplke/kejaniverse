import { AddTenantForm } from "~/components/forms/add-tenant-form";
import { BackButton } from "~/components/ui/back-button";
import { getUnits } from "~/server/actions/units";

type Params = Promise<{ id: string }>;

export default async function AddTenantPage({ params }: { params: Params }) {
  const { id } = await params;
  const units = await getUnits(id);

  return (
    <div>
      <BackButton />
      <h1 className="my-4 text-2xl font-bold">Add Tenant</h1>
      <div className="max-w-xl">
        <AddTenantForm units={units} />
      </div>
    </div>
  );
}
