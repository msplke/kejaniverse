import ErrorPage from "~/components/pages/error";
import { DataTable } from "~/components/tables/data-table";
import { paymentTableColumns } from "~/components/tables/table-columns/payments";
import { api } from "~/trpc/server";

export default async function Payments({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let payments;
  try {
    payments = await api.payment.getAllPropertyPayments({
      propertyId: id,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
  }

  if (!payments) {
    return (
      <ErrorPage message="Unable to retrieve payment data. Please try again later." />
    );
  }

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
