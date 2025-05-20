import { AddUnitForm } from "~/components/forms/add-unit-form";
import { AddUnitsInBulkForm } from "~/components/forms/add-units-in-bulk-form";
import { BackButton } from "~/components/ui/back-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getUnitTypes } from "~/server/actions/units";

type Params = Promise<{ id: string }>;

export default async function AddUnitPage({ params }: { params: Params }) {
  const { id } = await params;

  const unitTypes = await getUnitTypes(id);

  return (
    <div>
      <BackButton />
      <h1 className="my-4 text-2xl font-bold">New Unit</h1>
      <Tabs defaultValue="single">
        <TabsList className="my-4">
          <TabsTrigger value="single">Add Single</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Add</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <div className="max-w-xs">
            <AddUnitForm unitTypes={unitTypes} propertyId={id} />
          </div>
        </TabsContent>
        <TabsContent value="bulk">
          <div className="text-muted-foreground mb-8 max-w-[60ch]">
            <p>
              This will create units from the start to the end number, all of
              the same type.
            </p>
            <p>
              For example, if you enter 1 and 5, it will create units 1, 2, 3,
              4, and 5.
            </p>
          </div>

          <div className="max-w-xs">
            <AddUnitsInBulkForm unitTypes={unitTypes} propertyId={id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
