import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "./ui/tables/data-table";
import {
  recentPaymentsTableColumns,
  type Payment,
} from "./ui/tables/table-columns/recent-payments";

type PropertyDashboardData = {
  recentPayments: Payment[];
  totalRevenue: number;
  totalUnits: number;
  occupiedUnits: number;
};

export function PropertyDashboard({ data }: { data: PropertyDashboardData }) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold">KES {data.totalRevenue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Units Occupied</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold">
              {data.occupiedUnits}/{data.totalUnits}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="mb-2 text-2xl font-bold">Recent Payments</h2>
        <p className="text-muted-foreground text-sm">
          This table shows the 5 most recent payments made by tenants.
        </p>
        <DataTable
          columns={recentPaymentsTableColumns}
          data={data.recentPayments}
          showPagination={false}
        />
      </div>
    </div>
  );
}
