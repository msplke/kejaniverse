import { NewUnitForm } from "~/components/ui/forms/NewUnitForm";
import { getUnitTypes } from "~/server/actions";

type Params = Promise<{ id: string }>;

export default async function NewUnit({ params }: { params: Params }) {
  const { id } = await params;

  const unitTypes = await getUnitTypes(id);

  return (
    <div>
      <h1 className="text-2xl font-bold">New Unit</h1>
      <p className="text-sm">Create a new unit for your property.</p>
      <div className="mt-4">
        <NewUnitForm unitTypes={unitTypes} />
      </div>
    </div>
  );
}
