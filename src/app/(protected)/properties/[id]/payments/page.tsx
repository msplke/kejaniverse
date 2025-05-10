import { DataTable } from "~/components/ui/tables/data-table";
import { paymentTableColumns } from "~/components/ui/tables/table-columns/payments";
import { api } from "~/trpc/server";

export default async function Payments({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payments = await api.payment.getAllPropertyPayments({ propertyId: id });
  return (
    <div>
      <h1 className="my-4 text-2xl font-bold">Payments</h1>
      <DataTable
        data={payments}
        columns={paymentTableColumns}
        filterOptions={{
          keywordFilterKey: "tenant",
          popoverFilterOptions: {
            dateRangeKey: "paidAt",
            unitTypeKey: "unitType",
            unitStatusKey: "unitStatus",
          },
        }}
      />
    </div>
  );
}
