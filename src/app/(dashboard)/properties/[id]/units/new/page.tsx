import { AddUnitForm } from "~/components/ui/forms/AddUnitForm";
import { getUnitTypes } from "~/server/actions";

type Params = Promise<{ id: string }>;

export default async function AddUnit({ params }: { params: Params }) {
  const { id } = await params;

  const unitTypes = await getUnitTypes(id);

  return (
    <div>
      <h1 className="my-4 text-2xl font-bold">New Unit</h1>
      <div className="max-w-xs">
        <AddUnitForm unitTypes={unitTypes} propertyId={id} />
      </div>
    </div>
  );
}
